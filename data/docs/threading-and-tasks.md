---
title: Chrome의 스레딩과 태스크
order: 29
group: 번역 · docs
description: Chrome의 스레딩 모델과 태스크 실행
source_path: docs/threading_and_tasks.md
source_sha256: 9509b1038e0c5dc1091347599dd99e6a90987888078e65adbd9610e2a7c87999
translation_status: full
---
> 이 문서는 **Threading and Tasks in Chrome**([`docs/threading_and_tasks.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks.md)) 문서의 한국어 전체 번역입니다.

참고: 더 많은 예제는 [스레딩과 태스크 FAQ](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks_faq.md)를 보라.

## 개요

Chrome은 [멀티 프로세스 아키텍처](https://www.chromium.org/developers/design-documents/multi-process-architecture)를 가지고 있으며, 각 프로세스는 매우 많이 멀티스레드화되어 있다. 이 문서에서는 각 프로세스가 공유하는 기본 스레딩 시스템을 살펴본다. 우리의 주된 목표는 브라우저를 매우 반응성 있게 유지하는 것이다. 지연 시간이나 워크로드에 대한 외부 요구사항이 없다면, Chrome은 [높은 동시성을 갖지만 반드시 병렬적일 필요는 없는](https://stackoverflow.com/questions/1050222/what-is-the-difference-between-concurrency-and-parallelism#:~:text=Concurrency%20is%20when%20two%20or,e.g.%2C%20on%20a%20multicore%20processor.) 시스템이 되려고 한다.

Chromium이 동시성을 다루는 방식, 특히 시퀀스(Sequences)에 대한 기본 소개는 [여기](https://docs.google.com/presentation/d/1ujV8LjIUyPBmULzdT2aT9Izte8PDwbJi)에서 볼 수 있다.

이 문서는 컴퓨터 과학의 [스레딩 개념](https://en.wikipedia.org/wiki/Thread_(computing))에 익숙하다고 가정한다.

### 빠른 시작 가이드

 * 메인 스레드, 즉 브라우저 프로세스의 “UI” 스레드나 IO 스레드, 즉 IPC 수신을 위한 각 프로세스의 스레드에서 비용이 큰 계산이나 블로킹 IO를 수행하지 말라. 바쁜 UI / IO 스레드는 사용자에게 보이는 지연 시간을 유발할 수 있으므로, 그런 작업은 [스레드 풀](#스레드-풀에-직접-게시)에서 실행하는 것을 선호하라.
 * 별도 스레드나 시퀀스에서 메모리의 같은 위치를 읽고/쓰는 일은 항상 피하라. 이는 [데이터 레이스](https://en.wikipedia.org/wiki/Race_condition#Data_race)로 이어진다! 대신 시퀀스 사이에서 메시지를 전달하는 것을 선호하라. 락 사용 같은 메시지 전달의 대안은 권장되지 않는다.
 * 서로 다른 시퀀스에 존재하는 여러 객체를 조율해야 한다면, 객체 수명에 주의하라.
    * 우발적인 데이터 레이스를 막기 위해 대부분의 클래스는 단일 시퀀스에서만 독점적으로 사용되도록 하는 것을 선호하라. 이 제약을 강제하는 데 도움이 되도록 [SEQUENCE_CHECKER][4]나 [base::SequenceBound][5] 같은 유틸리티를 사용해야 한다.
    * 경험칙으로 [base::Unretained][1]는 피하라. 보통 [weak pointer][2]로 대체할 수 있다.
    * `std::unique_ptr`를 통한 명시적 소유권을 선호한다.
    * [scoped_refptr][3]은 여러 시퀀스에 걸쳐 여러 소유자가 있는 객체에 사용할 수 있다. 이는 보통 잘못된 설계 패턴이며 새 코드에는 권장되지 않는다.

[1]: https://source.chromium.org/chromium/chromium/src/+/main:base/functional/bind.h;l=169;drc=ef1375f2c9fffa0d9cd664b43b0035c09fb70e99
[2]: https://source.chromium.org/chromium/chromium/src/+/main:base/memory/weak_ptr.h
[3]: https://source.chromium.org/chromium/chromium/src/+/main:base/memory/scoped_refptr.h
[4]: https://source.chromium.org/chromium/chromium/src/+/main:base/sequence_checker.h
[5]: https://source.chromium.org/chromium/chromium/src/+/main:base/threading/sequence_bound.h

## 핵심 개념
 * **태스크(Task)**: 처리될 작업의 단위. 사실상 선택적으로 연결된 상태를 가진 함수 포인터다. Chrome에서는 각각 `base::BindOnce`와 `base::BindRepeating`으로 생성되는 `base::OnceCallback`과 `base::RepeatingCallback`이다. ([문서](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/callback.md)).
 * **태스크 큐(Task queue)**: 처리될 태스크들의 큐.
 * **물리 스레드(Physical thread)**: 운영체제가 제공하는 스레드, 예를 들어 POSIX의 pthread 또는 Windows의 CreateThread(). Chrome의 크로스 플랫폼 추상화는 `base::PlatformThread`다. 이것을 직접 사용할 일은 거의 없어야 한다.
 * **`base::Thread`**: Quit()될 때까지 전용 태스크 큐에서 메시지를 계속 처리하는 물리 스레드. 직접 `base::Thread`를 만드는 일은 거의 없어야 한다.
 * **스레드 풀(Thread pool)**: 공유 태스크 큐를 가진 물리 스레드들의 풀. Chrome에서는 `base::ThreadPoolInstance`다. Chrome 프로세스마다 정확히 하나의 인스턴스가 있고, [`base/task/thread_pool.h`](https://cs.chromium.org/chromium/src/base/task/thread_pool.h)를 통해 게시된 태스크를 처리한다. 따라서 `base::ThreadPoolInstance` API를 직접 사용할 필요는 드물다. 태스크 게시에 대해서는 뒤에서 더 설명한다.
 * **시퀀스(Sequence)** 또는 **가상 스레드(Virtual thread)**: Chrome이 관리하는 실행 스레드. 물리 스레드처럼 주어진 시퀀스 / 가상 스레드에서는 어느 순간에도 하나의 태스크만 실행될 수 있으며, 각 태스크는 앞선 태스크들의 부수 효과를 본다. 태스크들은 순차적으로 실행되지만 각 태스크 사이에서 물리 스레드를 옮겨 다닐 수 있다.
 * **태스크 러너(Task runner)**: 태스크를 게시할 수 있는 인터페이스. Chrome에서는 `base::TaskRunner`다.
 * **시퀀스 태스크 러너(Sequenced task runner)**: 게시된 태스크가 게시 순서대로 순차 실행됨을 보장하는 태스크 러너. 각 태스크는 자기 앞 태스크의 부수 효과를 보도록 보장된다. 시퀀스 태스크 러너에 게시된 태스크는 보통 단일 스레드, 즉 가상 또는 물리 스레드에서 처리된다. Chrome에서는 `base::TaskRunner`의 일종인 `base::SequencedTaskRunner`다.
 * **단일 스레드 태스크 러너(Single-thread task runner)**: 모든 태스크가 같은 물리 스레드에서 처리됨을 보장하는 시퀀스 태스크 러너. Chrome에서는 `base::SequencedTaskRunner`의 일종인 `base::SingleThreadTaskRunner`다. 가능할 때마다 우리는 [스레드보다 시퀀스를 선호](#물리-스레드보다-시퀀스를-선호하라)한다.

## 스레딩 어휘
독자 참고: 다음 용어들은 일반적인 스레딩 명명법과 Chrome에서 사용하는 방식을 이어 주려는 시도다. 막 시작했다면 다소 무거울 수 있다. 이해하기 어렵다면 아래의 더 상세한 섹션으로 건너뛰고 필요할 때 다시 참조하는 것을 고려하라.

 * **스레드-불안전(Thread-unsafe)**: Chrome의 압도적 다수 타입은 의도적으로 스레드-불안전하다. 이런 타입/메서드에 대한 접근은 외부에서 동기화되어야 한다. 보통 스레드-불안전 타입은 그 상태에 접근하는 모든 태스크가 같은 `base::SequencedTaskRunner`에 게시되어야 하며, 디버그 빌드에서는 `SEQUENCE_CHECKER` 멤버로 이를 검증한다. 접근 동기화를 위해 락도 선택지일 수 있지만 Chrome에서는 [락보다 시퀀스를 선호](#락-대신-시퀀스-사용)한다.
 * **스레드-친화(Thread-affine)**: 이런 타입/메서드는 항상 같은 물리 스레드, 즉 같은 `base::SingleThreadTaskRunner`에서 접근되어야 하며, 보통 이를 검증하기 위한 `THREAD_CHECKER` 멤버를 가진다. 서드파티 API를 사용하거나 스레드-친화적인 리프 의존성이 있는 경우가 아니라면, Chrome에서 타입이 스레드-친화적이어야 할 이유는 거의 없다. `base::SingleThreadTaskRunner`는 `base::SequencedTaskRunner`의 일종이므로 스레드-친화는 스레드-불안전의 부분집합이다. 스레드-친화는 때때로 **thread-hostile**이라고도 불린다.
 * **스레드-안전(Thread-safe)**: 이런 타입/메서드는 병렬로 안전하게 접근할 수 있다.
 * **스레드-호환(Thread-compatible)**: 이런 타입은 const 메서드에 대한 안전한 병렬 접근을 제공하지만 non-const 접근 또는 const/non-const 혼합 접근에는 동기화가 필요하다. Chrome은 reader-writer 락을 노출하지 않는다. 따라서 이 용도는 스레드-안전한 방식으로 한 번 초기화되고, 그 이후 영원히 불변인 객체, 보통 전역 객체뿐이다. 초기화는 시작 단계의 단일 스레드 구간에서 하거나 `base::NoDestructor` 같은 스레드-안전 static-local-initialization 패러다임을 통해 지연 수행될 수 있다.
 * **불변(Immutable)**: 생성 이후 수정될 수 없는 스레드-호환 타입의 부분집합.
 * **시퀀스-친화(Sequence-friendly)**: 이런 타입/메서드는 `base::SequencedTaskRunner`에서 호출되는 것을 지원하는 스레드-불안전 타입이다. 이상적으로는 모든 스레드-불안전 타입이 그래야 하지만, 레거시 코드에는 단순한 스레드-불안전 시나리오에서도 스레드-친화성을 강제하는 과도한 체크가 때때로 있다. 자세한 내용은 아래 [물리 스레드보다 시퀀스를 선호](#물리-스레드보다-시퀀스를-선호하라)를 보라.

### 스레드

모든 Chrome 프로세스에는 다음이 있다.

* 메인 스레드
   * 브라우저 프로세스에서는 BrowserThread::UI, 또는 iOS에서는 web::WebThread::UI: UI를 업데이트한다.
   * 렌더러 프로세스에서는 Blink 메인 스레드: Blink의 대부분을 실행한다.
* IO 스레드
   * 모든 프로세스에서: 모든 IPC 메시지는 이 스레드에 도착한다. 메시지를 처리하는 애플리케이션 로직은 다른 스레드에 있을 수 있다. 즉 IO 스레드가 메시지를 다른 스레드에 바인딩된 [Mojo 인터페이스](https://chromium.googlesource.com/chromium/src/+/main/docs/README.md#Mojo-Services)로 라우팅할 수 있다.
   * 더 일반적으로 대부분의 비동기 I/O는 이 스레드에서 일어난다. 예: base::FileDescriptorWatcher를 통해.
   * 브라우저 프로세스에서는 BrowserThread::IO라고 부르며, iOS에서는 web::WebThread::IO라고 부른다.
* 몇 개의 추가 특수 목적 스레드
* 그리고 범용 스레드 풀

대부분의 스레드는 큐에서 태스크를 가져와 실행하는 루프를 가진다. 이 큐는 여러 스레드 사이에서 공유될 수 있다.

### 태스크

태스크는 비동기 실행을 위해 큐에 추가된 `base::OnceClosure`다.

`base::OnceClosure`는 함수 포인터와 인자를 저장한다. 바인딩된 인자를 사용해 함수 포인터를 호출하는 `Run()` 메서드를 가진다. 이는 `base::BindOnce`를 사용해 생성된다. ([Callback<> 및 Bind() 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/callback.md) 참고).

```
void TaskA() {}
void TaskB(int v) {}

auto task_a = base::BindOnce(&TaskA);
auto task_b = base::BindOnce(&TaskB, 42);
```

태스크 그룹은 다음 방식 중 하나로 실행될 수 있다.

* [병렬](#병렬-태스크-게시): 태스크 실행 순서가 없으며, 어떤 스레드에서든 모두 동시에 실행될 수 있음
* [시퀀스](#시퀀스-태스크-게시): 태스크가 게시 순서대로, 한 번에 하나씩, 어떤 스레드에서든 실행됨.
* [단일 스레드](#같은-스레드에-여러-태스크-게시): 태스크가 게시 순서대로, 한 번에 하나씩, 단일 스레드에서 실행됨.
   * [COM 단일 스레드](#com-single-thread-apartmentsta-스레드에-태스크-게시windows): COM이 초기화된 단일 스레드 방식의 변형.

### 물리 스레드보다 시퀀스를 선호하라

시퀀스 실행, 즉 가상 스레드 위 실행은 단일 스레드 실행, 즉 물리 스레드 위 실행보다 강하게 선호된다. 메인 스레드(UI)나 IO 스레드에 묶인 타입/메서드를 제외하면, 스레드 안전성은 직접 물리 스레드를 관리하는 것보다 `base::SequencedTaskRunner`를 통해 더 잘 달성된다. 아래 [시퀀스 태스크 게시](#시퀀스-태스크-게시)를 참고하라.

"현재 물리 스레드"용으로 노출된 모든 API에는 "현재 시퀀스"용 동등 API가 있다([매핑](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks_faq.md#How-to-migrate-from-SingleThreadTaskRunner-to-SequencedTaskRunner)).

시퀀스-친화 타입을 작성하는 중 리프 의존성에서 스레드-친화성 체크, 예를 들어 `THREAD_CHECKER`에 실패한다면, 그 의존성도 시퀀스-친화적으로 만드는 것을 고려하라. Chrome의 대부분 핵심 API는 시퀀스-친화적이지만, 일부 레거시 타입은 "현재 시퀀스"에 의존할 수 있고 더 이상 스레드-친화적일 필요가 없는데도 여전히 ThreadChecker/SingleThreadTaskRunner를 과도하게 사용할 수 있다.

## 병렬 태스크 게시

### 스레드 풀에 직접 게시

어떤 스레드에서든 실행될 수 있고 다른 태스크와 순서나 상호 배제 요구사항이 없는 태스크는 [`base/task/thread_pool.h`](https://cs.chromium.org/chromium/src/base/task/thread_pool.h)에 정의된 `base::ThreadPool::PostTask*()` 함수 중 하나를 사용해 게시해야 한다.

```cpp
base::ThreadPool::PostTask(FROM_HERE, base::BindOnce(&Task));
```

이는 기본 traits로 태스크를 게시한다.

`base::ThreadPool::PostTask*()` 함수는 호출자가 TaskTraits를 통해 태스크에 대한 추가 세부 정보를 제공할 수 있게 한다([TaskTraits로 태스크 주석 달기](#tasktraits로-태스크-주석-달기) 참고).

```cpp
base::ThreadPool::PostTask(
    FROM_HERE, {base::TaskPriority::BEST_EFFORT, MayBlock()},
    base::BindOnce(&Task));
```

### TaskRunner를 통한 게시

병렬 [`base::TaskRunner`](https://cs.chromium.org/chromium/src/base/task/task_runner.h)는 `base::ThreadPool::PostTask*()`를 직접 호출하는 것의 대안이다. 이는 주로 태스크가 병렬로, 시퀀스로, 또는 단일 스레드로 게시될지 미리 알 수 없을 때 유용하다([시퀀스 태스크 게시](#시퀀스-태스크-게시), [같은 스레드에 여러 태스크 게시](#같은-스레드에-여러-태스크-게시) 참고). `base::TaskRunner`는 `base::SequencedTaskRunner`와 `base::SingleThreadTaskRunner`의 기반 클래스이므로, `scoped_refptr<TaskRunner>` 멤버는 `base::TaskRunner`, `base::SequencedTaskRunner`, 또는 `base::SingleThreadTaskRunner`를 담을 수 있다.

```cpp
class A {
 public:
  A() = default;

  void PostSomething() {
    task_runner_->PostTask(FROM_HERE, base::BindOnce(&A, &DoSomething));
  }

  void DoSomething() {
  }

 private:
  scoped_refptr<base::TaskRunner> task_runner_ =
      base::ThreadPool::CreateTaskRunner({base::TaskPriority::USER_VISIBLE});
};
```

테스트가 태스크 실행 방식을 정확히 제어해야 하는 경우가 아니라면, `base::ThreadPool::PostTask*()`를 직접 호출하는 것을 선호한다. 테스트에서 태스크를 덜 침습적으로 제어하는 방법은 [테스트](#테스트)를 참고하라.

## 시퀀스 태스크 게시

시퀀스는 게시 순서대로 한 번에 하나씩 실행되는 태스크들의 집합이다. 반드시 같은 스레드에서 실행되는 것은 아니다. 시퀀스의 일부로 태스크를 게시하려면 [`base::SequencedTaskRunner`](https://cs.chromium.org/chromium/src/base/task/sequenced_task_runner.h)를 사용하라.

### 새 시퀀스에 게시

`base::SequencedTaskRunner`는 `base::ThreadPool::CreateSequencedTaskRunner()`로 생성할 수 있다.

```cpp
scoped_refptr<SequencedTaskRunner> sequenced_task_runner =
    base::ThreadPool::CreateSequencedTaskRunner(...);

// TaskB는 TaskA가 완료된 뒤 실행된다.
sequenced_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskA));
sequenced_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskB));
```

### 현재 (가상) 스레드에 게시

현재 (가상) 스레드에 게시하는 선호 방식은 `base::SequencedTaskRunner::GetCurrentDefault()`를 통하는 것이다.

```cpp
// 태스크는 현재 (가상) 스레드의 기본 태스크 큐에서 실행된다.
base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
    FROM_HERE, base::BindOnce(&Task));
```

`SequencedTaskRunner::GetCurrentDefault()`는 현재 가상 스레드의 기본 큐를 반환한다는 점에 유의하라. 여러 태스크 큐를 가진 스레드, 예를 들어 BrowserThread::UI에서는 이것이 현재 태스크가 속한 큐와 다를 수 있다. "현재" 태스크 러너는 의도적으로 static getter를 통해 노출되지 않는다. 이미 알고 있다면 직접 게시할 수 있고, 모른다면 유일하게 합리적인 대상은 기본 큐다. 자세한 논의는 https://bit.ly/3JvCLsX 를 보라.

## 락 대신 시퀀스 사용

Chrome에서 락 사용은 권장되지 않는다. 시퀀스는 본질적으로 스레드 안전성을 제공한다. 락으로 직접 스레드 안전성을 관리하기보다 항상 같은 시퀀스에서 접근되는 클래스를 선호하라.

**스레드-안전하지만 스레드-친화적이지 않다; 어떻게 가능한가?** 같은 시퀀스에 게시된 태스크들은 순차 순서로 실행된다. 시퀀스 태스크가 완료된 뒤 다음 태스크는 다른 워커 스레드가 가져갈 수 있지만, 그 태스크는 자신의 시퀀스에서 이전 태스크들이 일으킨 모든 부수 효과를 보도록 보장된다.

```cpp
class A {
 public:
  A() {
    // 생성 시퀀스에서 접근해야 한다고 요구하지 않는다.
    DETACH_FROM_SEQUENCE(sequence_checker_);
  }

  void AddValue(int v) {
    // 모든 접근이 같은 시퀀스에서 이루어지는지 확인한다.
    DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
    values_.push_back(v);
}

 private:
  SEQUENCE_CHECKER(sequence_checker_);

  // 모든 접근이 같은 시퀀스에서 이루어지므로 락이 필요 없다.
  std::vector<int> values_;
};

A a;
scoped_refptr<SequencedTaskRunner> task_runner_for_a = ...;
task_runner_for_a->PostTask(FROM_HERE,
                      base::BindOnce(&A::AddValue, base::Unretained(&a), 42));
task_runner_for_a->PostTask(FROM_HERE,
                      base::BindOnce(&A::AddValue, base::Unretained(&a), 27));

// 다른 시퀀스에서 접근하면 DCHECK 실패가 발생한다.
scoped_refptr<SequencedTaskRunner> other_task_runner = ...;
other_task_runner->PostTask(FROM_HERE,
                            base::BindOnce(&A::AddValue, base::Unretained(&a), 1));
```

락은 여러 스레드에서 접근할 수 있는 공유 데이터 구조를 교체하는 데만 사용해야 한다. 한 스레드가 비용이 큰 계산이나 디스크 접근을 통해 그것을 업데이트한다면, 그 느린 작업은 락을 잡지 않은 채 수행되어야 한다. 결과를 사용할 수 있게 되었을 때에만 락을 사용해 새 데이터를 교체해야 한다. 이에 대한 예는 PluginList::LoadPlugins([`content/browser/plugin_list.cc`](https://cs.chromium.org/chromium/src/content/browser/plugin_list.cc))에 있다. 반드시 락을 사용해야 한다면, [여기](https://www.chromium.org/developers/lock-and-condition-variable)에 몇 가지 모범 사례와 피해야 할 함정이 있다.

논블로킹 코드를 작성하기 위해 Chrome의 많은 API는 비동기적이다. 보통 이는 특정 스레드/시퀀스에서 실행되어야 하고 커스텀 delegate 인터페이스를 통해 결과를 반환하거나, 요청된 작업이 완료될 때 호출되는 `base::OnceCallback<>` 또는 `base::RepeatingCallback<>` 객체를 받는다는 의미다. 특정 스레드/시퀀스에서 작업을 실행하는 것은 위의 PostTask 섹션에서 다룬다.

## 같은 스레드에 여러 태스크 게시

여러 태스크가 같은 스레드에서 실행되어야 한다면 [`base::SingleThreadTaskRunner`](https://cs.chromium.org/chromium/src/base/task/single_thread_task_runner.h)에 게시하라. 같은 `base::SingleThreadTaskRunner`에 게시된 모든 태스크는 같은 스레드에서 게시 순서대로 실행된다.

### 브라우저 프로세스의 메인 스레드 또는 IO 스레드에 게시

메인 스레드 또는 IO 스레드에 태스크를 게시하려면 [`content/public/browser/browser_thread.h`](https://cs.chromium.org/chromium/src/content/public/browser/browser_thread.h)의 `content::GetUIThreadTaskRunner({})` 또는 `content::GetIOThreadTaskRunner({})`를 사용하라.

이 메서드들에 추가 BrowserTaskTraits를 매개변수로 제공할 수 있지만, BrowserThreads에서는 여전히 일반적으로 드물며 고급 사용 사례에 한정해야 한다.

이전의 traits가 있는 base API에서 벗어나는 진행 중인 마이그레이션([task APIs v3])이 있으며, 코드베이스 전반에서 아직 다음 형태를 볼 수 있다. 이는 동등하다.

```cpp
base::PostTask(FROM_HERE, {content::BrowserThread::UI}, ...);

base::CreateSingleThreadTaskRunner({content::BrowserThread::IO})
    ->PostTask(FROM_HERE, ...);
```

참고: 마이그레이션 기간 동안 browser_thread.h API를 사용하려면 안타깝게도 계속해서 [`content/public/browser/browser_task_traits.h`](https://cs.chromium.org/chromium/src/content/public/browser/browser_task_traits.h)를 수동으로 include해야 한다.

메인 스레드와 IO 스레드는 이미 매우 바쁘다. 따라서 가능할 때는 범용 스레드에 게시하는 것을 선호하라([병렬 태스크 게시](#병렬-태스크-게시), [시퀀스 태스크 게시](#시퀀스-태스크-게시) 참고). 메인 스레드에 게시할 좋은 이유는 UI를 업데이트하거나 그것에 묶인 객체, 예를 들어 `Profile`에 접근하는 것이다. IO 스레드에 게시할 좋은 이유는 그것에 묶인 컴포넌트 내부, 예를 들어 IPC나 네트워크에 접근하는 것이다. 참고: IPC를 송수신하거나 네트워크에서 데이터를 송수신하기 위해 IO 스레드로 명시적인 post task를 할 필요는 없다.

### 렌더러 프로세스의 메인 스레드에 게시
TODO(blink-dev)

### 커스텀 SingleThreadTaskRunner에 게시

여러 태스크가 같은 스레드에서 실행되어야 하고 그 스레드가 메인 스레드나 IO 스레드일 필요가 없다면, `base::Threadpool::CreateSingleThreadTaskRunner`로 생성된 `base::SingleThreadTaskRunner`에 게시하라.

```cpp
scoped_refptr<SingleThreadTaskRunner> single_thread_task_runner =
    base::Threadpool::CreateSingleThreadTaskRunner(...);

// TaskB는 TaskA가 완료된 뒤 실행된다. 두 태스크 모두 같은 스레드에서 실행된다.
single_thread_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskA));
single_thread_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskB));
```

우리는 [물리 스레드보다 시퀀스를 선호](#물리-스레드보다-시퀀스를-선호하라)하며, 따라서 이것이 필요한 경우는 드물어야 함을 기억하라.

### 현재 스레드에 게시

*** note
**중요:** 현재 태스크 시퀀스와 상호 배제가 필요하지만 반드시 현재 물리 스레드에서 실행될 필요는 없는 태스크를 게시하려면 `base::SingleThreadTaskRunner::GetCurrentDefault()` 대신 `base::SequencedTaskRunner::GetCurrentDefault()`를 사용하라([현재 시퀀스에 게시](#현재-가상-스레드에-게시) 참고). 그러면 게시된 태스크의 요구사항을 더 잘 문서화하고, API를 불필요하게 물리 스레드-친화적으로 만드는 일을 피할 수 있다. 단일 스레드 태스크에서 `base::SequencedTaskRunner::GetCurrentDefault()`는 `base::SingleThreadTaskRunner::GetCurrentDefault()`와 동등하다.
***

그럼에도 현재 물리 스레드에 태스크를 게시해야 한다면 [`base::SingleThreadTaskRunner::CurrentDefaultHandle`](https://source.chromium.org/chromium/chromium/src/+/main:base/task/single_thread_task_runner.h)을 사용하라.

```cpp
// 태스크는 미래에 현재 스레드에서 실행된다.
base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
    FROM_HERE, base::BindOnce(&Task));
```

## COM Single-Thread Apartment(STA) 스레드에 태스크 게시(Windows)

COM Single-Thread Apartment(STA) 스레드에서 실행되어야 하는 태스크는 `base::ThreadPool::CreateCOMSTATaskRunner()`가 반환하는 `base::SingleThreadTaskRunner`에 게시해야 한다. [같은 스레드에 여러 태스크 게시](#같은-스레드에-여러-태스크-게시)에서 언급했듯, 같은 `base::SingleThreadTaskRunner`에 게시된 모든 태스크는 같은 스레드에서 게시 순서대로 실행된다.

```cpp
// Task(A|B|C)UsingCOMSTA는 같은 COM STA 스레드에서 실행된다.

void TaskAUsingCOMSTA() {
  // [ 이것은 COM STA 스레드에서 실행된다. ]

  // COM STA 호출을 수행한다.
  // ...

  // 현재 COM STA 스레드에 다른 태스크를 게시한다.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&TaskCUsingCOMSTA));
}
void TaskBUsingCOMSTA() { }
void TaskCUsingCOMSTA() { }

auto com_sta_task_runner = base::ThreadPool::CreateCOMSTATaskRunner(...);
com_sta_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskAUsingCOMSTA));
com_sta_task_runner->PostTask(FROM_HERE, base::BindOnce(&TaskBUsingCOMSTA));
```

## 게시된 태스크의 메모리 순서 보장

이 태스크 시스템은 태스크를 게시하기 전 순차 실행의 모든 메모리 효과가 태스크가 실행을 시작할 때 _보이도록_ 보장한다. 더 형식적으로는, `PostTask()` 호출과 게시된 태스크의 실행은 서로 [happens-before 관계](https://preshing.com/20130702/the-happens-before-relation/)에 있다. 이는 `PostTaskAndReply()`를 포함해 `::base`에서 태스크를 게시하는 모든 변형에 대해 참이다. 마찬가지로 같은 SequencedTaskRunner의 일부로 시퀀스에서 실행되는 태스크들 사이에도 happens-before 관계가 존재한다.

이 보장은 알아 둘 필요가 있다. Chrome 태스크는 `base::OnceCallback` 안으로 복사된 즉각적인 데이터 너머의 메모리에 흔히 접근하며, 이 happens-before 관계 덕분에 태스크 자체 안에서 추가 동기화를 피할 수 있기 때문이다. 매우 구체적인 예로, 태스크를 게시하는 스레드에서 막 초기화한 메모리에 대한 포인터를 바인딩하는 콜백을 생각해 보라.

더 제약된 모델도 주목할 만하다. 실행은 서로 다른 태스크 러너에서 실행되는 태스크들로 나뉠 수 있으며, 각 태스크는 명시적 동기화 없이 메모리의 특정 객체에 _독점적으로_ 접근한다. 다른 태스크를 게시하는 것은 이 '소유권'(객체들의 소유권)을 다음 태스크로 이전한다. 이를 통해 객체 소유권 개념을 종종 태스크 러너 수준까지 확장할 수 있고, 이는 추론에 유용한 불변 조건을 제공한다. 이 모델은 락과 atomic 연산을 피하면서도 race condition을 피할 수 있게 한다. 단순성 때문에 이 모델은 Chrome에서 흔히 사용된다.

## TaskTraits로 태스크 주석 달기

[`base::TaskTraits`](https://cs.chromium.org/chromium/src/base/task/task_traits.h)는 스레드 풀이 더 나은 스케줄링 결정을 내리는 데 도움이 되는 태스크 정보를 캡슐화한다.

`base::TaskTraits`를 받는 메서드에는 기본 traits로 충분할 때 `{}`를 전달할 수 있다. 기본 traits는 다음 태스크에 적합하다.

- 블로킹하지 않음(MayBlock과 WithBaseSyncPrimitives 참고);
- 사용자 차단 활동과 관련됨;
  (명시적으로 또는 그런 컴포넌트와의 순서 의존성을 가짐으로써 암묵적으로)
- 종료를 막거나 종료 시 건너뛸 수 있음(스레드 풀이 적합한 기본값을 자유롭게 선택함).

이 설명과 맞지 않는 태스크는 명시적 TaskTraits와 함께 게시되어야 한다.

[`base/task/task_traits.h`](https://cs.chromium.org/chromium/src/base/task/task_traits.h)는 사용 가능한 traits에 대한 포괄적 문서를 제공한다. content 계층도 BrowserThread에 태스크를 게시하기 쉽게 하기 위해 [`content/public/browser/browser_task_traits.h`](https://cs.chromium.org/chromium/src/content/public/browser/browser_task_traits.h)에 추가 traits를 제공한다.

아래는 `base::TaskTraits`를 지정하는 몇 가지 예다.

```cpp
// 이 태스크에는 명시적 TaskTraits가 없다. 블로킹할 수 없다. 우선순위는
// USER_BLOCKING이다. 종료를 막거나 종료 시 건너뛰어진다.
base::ThreadPool::PostTask(FROM_HERE, base::BindOnce(...));

// 이 태스크는 가장 높은 우선순위를 가진다. 스레드 풀은
// USER_VISIBLE 및 BEST_EFFORT 태스크보다 먼저 이를 스케줄한다.
base::ThreadPool::PostTask(
    FROM_HERE, {base::TaskPriority::USER_BLOCKING},
    base::BindOnce(...));

// 이 태스크는 가장 낮은 우선순위를 가지며 블로킹이 허용된다. 예를 들어
// 디스크에서 파일을 읽을 수 있다.
base::ThreadPool::PostTask(
    FROM_HERE, {base::TaskPriority::BEST_EFFORT, base::MayBlock()},
    base::BindOnce(...));

// 이 태스크는 종료를 막는다. 프로세스는 그 실행이 완료되기 전에는
// 종료되지 않는다.
base::ThreadPool::PostTask(
    FROM_HERE, {base::TaskShutdownBehavior::BLOCK_SHUTDOWN},
    base::BindOnce(...));
```

## 브라우저 반응성 유지

메인 스레드, IO 스레드, 또는 낮은 지연 시간으로 태스크를 실행할 것으로 기대되는 어떤 시퀀스에서도 비용이 큰 작업을 수행하지 말라. 대신 `base::ThreadPool::PostTaskAndReply*()` 또는 `base::SequencedTaskRunner::PostTaskAndReply()`를 사용해 비용이 큰 작업을 비동기적으로 수행하라. IO 스레드의 비동기/overlapped I/O는 괜찮다는 점에 유의하라.

예: 아래 코드를 메인 스레드에서 실행하면 브라우저가 오랜 시간 사용자 입력에 응답하지 못하게 된다.

```cpp
// GetHistoryItemsFromDisk()는 오랫동안 블로킹할 수 있다.
// AddHistoryItemsToOmniboxDropDown()은 UI를 업데이트하므로 반드시
// 메인 스레드에서 호출되어야 한다.
AddHistoryItemsToOmniboxDropdown(GetHistoryItemsFromDisk("keyword"));
```

아래 코드는 스레드 풀에서 `GetHistoryItemsFromDisk()` 호출을 스케줄한 다음, 원래 시퀀스, 이 경우 메인 스레드에서 `AddHistoryItemsToOmniboxDropdown()` 호출을 수행하도록 하여 문제를 해결한다. 첫 번째 호출의 반환값은 자동으로 두 번째 호출의 인자로 제공된다.

```cpp
base::ThreadPool::PostTaskAndReplyWithResult(
    FROM_HERE, {base::MayBlock()},
    base::BindOnce(&GetHistoryItemsFromDisk, "keyword"),
    base::BindOnce(&AddHistoryItemsToOmniboxDropdown));
```

## 지연을 가진 태스크 게시

### 지연이 있는 일회성 태스크 게시

지연 시간이 만료된 뒤 한 번 실행되어야 하는 태스크를 게시하려면 `base::ThreadPool::PostDelayedTask*()` 또는 `base::TaskRunner::PostDelayedTask()`를 사용하라.

```cpp
base::ThreadPool::PostDelayedTask(
  FROM_HERE, {base::TaskPriority::BEST_EFFORT}, base::BindOnce(&Task),
  base::Hours(1));

scoped_refptr<base::SequencedTaskRunner> task_runner =
    base::ThreadPool::CreateSequencedTaskRunner(
        {base::TaskPriority::BEST_EFFORT});
task_runner->PostDelayedTask(
    FROM_HERE, base::BindOnce(&Task), base::Hours(1));
```

*** note
**참고:** 1시간 지연을 가진 태스크는 아마 지연이 만료되자마자 즉시 실행될 필요가 없을 것이다. 지연이 만료될 때 브라우저를 느리게 하지 않도록 `base::TaskPriority::BEST_EFFORT`를 지정하라.
***

### 지연이 있는 반복 태스크 게시
정기적인 간격으로 실행되어야 하는 태스크를 게시하려면 [`base::RepeatingTimer`](https://cs.chromium.org/chromium/src/base/timer/timer.h)를 사용하라.

```cpp
class A {
 public:
  ~A() {
    // 타이머는 삭제될 때 자동으로 중지된다.
  }
  void StartDoingStuff() {
    timer_.Start(FROM_HERE, Seconds(1),
                 this, &A::DoStuff);
  }
  void StopDoingStuff() {
    timer_.Stop();
  }
 private:
  void DoStuff() {
    // 이 메서드는 StartDoingStuff()를 호출한 시퀀스에서 매초 호출된다.
  }
  base::RepeatingTimer timer_;
};
```

## 태스크 취소

### base::WeakPtr 사용

[`base::WeakPtr`](https://cs.chromium.org/chromium/src/base/memory/weak_ptr.h)는 객체에 바인딩된 모든 콜백이 그 객체가 파괴될 때 취소되도록 보장하는 데 사용할 수 있다.

```cpp
int Compute() { … }

class A {
 public:
  void ComputeAndStore() {
    // 스레드 풀에서 Compute() 호출을 스케줄한 뒤,
    // 현재 시퀀스에서 A::Store() 호출을 수행한다.
    // |weak_ptr_factory_|가 파괴되면 A::Store() 호출은 취소된다.
    // (|this|가 use-after-free되지 않음을 보장한다.)
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, base::BindOnce(&Compute),
        base::BindOnce(&A::Store, weak_ptr_factory_.GetWeakPtr()));
  }

 private:
  void Store(int value) { value_ = value; }

  int value_;
  base::WeakPtrFactory<A> weak_ptr_factory_{this};
};
```

참고: `WeakPtr`는 스레드-안전하지 않다. `~WeakPtrFactory()`와 `WeakPtr`에 바인딩된 `Store()`는 모두 같은 시퀀스에서 실행되어야 한다.

### base::CancelableTaskTracker 사용

[`base::CancelableTaskTracker`](https://cs.chromium.org/chromium/src/base/task/cancelable_task_tracker.h)는 태스크가 실행되는 시퀀스와 다른 시퀀스에서 취소가 일어날 수 있게 한다. `CancelableTaskTracker`는 이미 실행을 시작한 태스크를 취소할 수 없다는 점을 명심하라.

```cpp
auto task_runner = base::ThreadPool::CreateTaskRunner({});
base::CancelableTaskTracker cancelable_task_tracker;
cancelable_task_tracker.PostTask(task_runner.get(), FROM_HERE,
                                 base::DoNothing());
// Task()를 취소한다. 단, 아직 실행을 시작하지 않은 경우에만.
cancelable_task_tracker.TryCancelAll();
```

## 병렬로 실행할 Job 게시

[`base::PostJob`](https://cs.chromium.org/chromium/src/base/task/post_job.h)는 단일 base::RepeatingCallback 워커 태스크를 스케줄하고 ThreadPool 워커들이 이를 병렬로 호출하도록 요청할 수 있게 하는 파워 유저 API다.
이는 다음과 같은 퇴화 사례를 피한다.
* 각 작업 항목마다 `PostTask()`를 호출하여 상당한 오버헤드를 발생시키는 경우.
* 작업을 분할하는 고정 개수의 `PostTask()` 호출이 오랫동안 실행될 수 있는 경우. 많은 컴포넌트가 “코어 수”만큼의 태스크를 게시하고 모두가 모든 코어를 사용하기를 기대할 때 문제가 된다. 이런 경우 스케줄러는 동일 우선순위의 여러 요청에 공정하게 대응할 맥락 및/또는 높은 우선순위 작업이 들어올 때 낮은 우선순위 작업이 양보하도록 요청할 능력이 부족하다.

완전한 예제는 [`base/task/job_perftest.cc`](https://cs.chromium.org/chromium/src/base/task/job_perftest.cc)를 보라.

```cpp
// |worker_task|의 표준 구현.
void WorkerTask(base::JobDelegate* job_delegate) {
  while (!job_delegate->ShouldYield()) {
    auto work_item = TakeWorkItem(); // 가장 작은 작업 단위.
    if (!work_item)
      return:
    ProcessWork(work_item);
  }
}

// 완료되지 않은 작업 항목의 최신 스레드-안전 개수를 반환한다.
void NumIncompleteWorkItems(size_t worker_count) {
  // NumIncompleteWorkItems()는 로컬 작업 목록을 고려해야 할 때 |worker_count|를
  // 사용할 수 있다. 이는 직접 회계 처리하는 것보다 쉽다. 단, 실제 항목 수는
  // 레이스로 인해 과대 추정될 수 있으므로, 사용 가능한 작업이 없을 때도
  // WorkerTask()가 호출될 수 있음을 염두에 두어야 한다.
  return GlobalQueueSize() + worker_count;
}

base::PostJob(FROM_HERE, {},
              base::BindRepeating(&WorkerTask),
              base::BindRepeating(&NumIncompleteWorkItems));
```

호출되었을 때 루프 안에서 가능한 한 많은 작업을 수행함으로써 워커 태스크는 스케줄링 오버헤드를 피한다. 한편 `base::JobDelegate::ShouldYield()`는 조건부로 빠져나와 스케줄러가 다른 작업을 우선시할 수 있게 하기 위해 주기적으로 호출된다. 이 yield 의미론은 예를 들어 사용자에게 보이는 job이 모든 코어를 사용하되, 사용자 차단 태스크가 들어오면 비켜날 수 있게 한다.

### 실행 중인 job에 추가 작업 더하기

새 작업 항목이 추가되고 API 사용자가 추가 스레드가 워커 태스크를 병렬로 호출하기를 원한다면, 최대 동시성이 증가한 직후 `JobHandle/JobDelegate::NotifyConcurrencyIncrease()`가 호출되어야 *한다*.

## 테스트

자세한 내용은 [태스크를 게시하는 컴포넌트 테스트](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks_testing.md)를 보라.

`base::SingleThreadTaskRunner::CurrentDefaultHandle`, `base::SequencedTaskRunner::CurrentDefaultHandle` 또는 [`base/task/thread_pool.h`](https://cs.chromium.org/chromium/src/base/task/thread_pool.h)의 함수를 사용하는 코드를 테스트하려면, 테스트 범위에 대해 [`base::test::TaskEnvironment`](https://cs.chromium.org/chromium/src/base/test/task_environment.h)를 인스턴스화하라. BrowserThreads가 필요하다면 `base::test::TaskEnvironment` 대신 `content::BrowserTaskEnvironment`를 사용하라.

테스트는 `base::RunLoop`를 사용해 `base::test::TaskEnvironment`의 message pump를 실행할 수 있다. 이는 `Quit()`될 때까지, 명시적으로 또는 `RunLoop::QuitClosure()`를 통해 실행되게 할 수 있고, 또는 준비된 태스크에 대해 `RunUntilIdle()`을 실행한 뒤 즉시 반환하게 할 수 있다.

TaskEnvironment는 TestTimeouts::action_timeout() 이후 명시적으로 quit되지 않았다면 RunLoop::Run()이 GTEST_FAIL()하도록 구성한다. 이는 테스트 대상 코드가 RunLoop를 quit하도록 트리거하지 못했을 때 테스트가 멈춰 있는 것보다 낫다. 제한 시간은 base::test::ScopedRunLoopTimeout으로 재정의할 수 있다.

```cpp
class MyTest : public testing::Test {
 public:
  // ...
 protected:
   base::test::TaskEnvironment task_environment_;
};

TEST_F(MyTest, FirstTest) {
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(&A));
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
                                                   base::BindOnce(&B));
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE, base::BindOnce(&C), base::TimeDelta::Max());

  // 이것은 (SingleThread|Sequenced)TaskRunner::CurrentDefaultHandle 큐가 빌 때까지 실행한다.
  // 지연 태스크는 실행 시기가 될 때까지 큐에 추가되지 않는다.
  // 가능하면 RunUntilIdle보다 명시적 종료 조건을 선호하라:
  // bit.ly/run-until-idle-with-care2.
  base::RunLoop().RunUntilIdle();
  // A와 B가 실행되었다. C는 아직 실행 시기가 되지 않았다.

  base::RunLoop run_loop;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(&D));
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, run_loop.QuitClosure());
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(&E));

  // 이것은 QuitClosure가 호출될 때까지 (SingleThread|Sequenced)TaskRunner::CurrentDefaultHandle 큐를 실행한다.
  run_loop.Run();
  // D와 run_loop.QuitClosure()가 실행되었다. E는 아직 큐에 있다.

  // 스레드 풀에 게시된 태스크는 게시되는 대로 비동기 실행된다.
  base::ThreadPool::PostTask(FROM_HERE, {}, base::BindOnce(&F));
  auto task_runner =
      base::ThreadPool::CreateSequencedTaskRunner({});
  task_runner->PostTask(FROM_HERE, base::BindOnce(&G));

  // 스레드 풀에 게시된 모든 태스크의 실행이 끝날 때까지 블로킹하려면:
  base::ThreadPoolInstance::Get()->FlushForTesting();
  // F와 G가 실행되었다.

  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {}, base::BindOnce(&H), base::BindOnce(&I));

  // 이것은 (SingleThread|Sequenced)TaskRunner::CurrentDefaultHandle 큐와 ThreadPool 큐가 모두
  // 빌 때까지 (SingleThread|Sequenced)TaskRunner::CurrentDefaultHandle 큐를 실행한다.
  // 가능하면 RunUntilIdle보다 명시적 종료 조건을 선호하라:
  // bit.ly/run-until-idle-with-care2.
  task_environment_.RunUntilIdle();
  // E, H, I가 실행되었다.
}
```

## 새 프로세스에서 ThreadPool 사용

[`base/task/thread_pool.h`](https://cs.chromium.org/chromium/src/base/task/thread_pool.h)의 함수를 사용하려면 프로세스에서 ThreadPoolInstance가 먼저 초기화되어야 한다. Chrome 브라우저 프로세스와 자식 프로세스(렌더러, GPU, 유틸리티)에서 ThreadPoolInstance 초기화는 이미 처리되어 있다. 다른 프로세스에서 ThreadPoolInstance를 사용하려면 main 함수 초기에 ThreadPoolInstance를 초기화하라.

```cpp
// 이것은 기본 params로 ThreadPoolInstance를 초기화하고 시작한다.
base::ThreadPoolInstance::CreateAndStartWithDefaultParams("process_name");
// 이제 base::ThreadPool trait와 함께 base/task/thread_pool.h API를 사용할 수 있다.
// 태스크는 게시되는 대로 스케줄된다.

// 이것은 ThreadPoolInstance를 초기화한다.
base::ThreadPoolInstance::Create("process_name");
// 이제 base::ThreadPool trait와 함께 base/task/thread_pool.h API를 사용할 수 있다. Start()가
// 호출되기 전까지 스레드는 생성되지 않고 태스크도 스케줄되지 않는다.
base::ThreadPoolInstance::Get()->Start(params);
// 이제 ThreadPool은 스레드를 생성하고 태스크를 스케줄할 수 있다.
```

그리고 main 함수 후반에 ThreadPoolInstance를 종료하라.

```cpp
base::ThreadPoolInstance::Get()->Shutdown();
// TaskShutdownBehavior::BLOCK_SHUTDOWN으로 게시된 태스크와
// Shutdown() 호출 전에 실행을 시작한 TaskShutdownBehavior::SKIP_ON_SHUTDOWN 태스크는
// 이제 실행을 완료했다. TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN으로 게시된 태스크는
// 아직 실행 중일 수 있다.
```
## TaskRunner 소유권(의존성 주입을 권장하지 않음)

TaskRunner는 여러 컴포넌트를 거쳐 전달되어서는 안 된다. 대신 TaskRunner를 사용하는 컴포넌트가 그것을 생성하는 주체여야 한다.

TaskRunner가 많은 컴포넌트를 거쳐 전달되다가 결국 리프에서만 사용되었던 리팩터링의 [이 예](https://codereview.chromium.org/2885173002/)를 보라. 이제 리프는 [`base/task/thread_pool.h`](https://cs.chromium.org/chromium/src/base/task/thread_pool.h)에서 직접 TaskRunner를 얻을 수 있고 그래야 한다.

위에서 언급했듯 `base::test::TaskEnvironment`는 단위 테스트가 하위 TaskRunner에서 게시된 태스크를 제어할 수 있게 한다. 테스트가 태스크 순서를 더 정밀하게 제어해야 하는 드문 경우에는 TaskRunner의 의존성 주입이 유용할 수 있다. 그런 경우 선호되는 접근 방식은 다음과 같다.

```cpp
class Foo {
 public:

  // 테스트에서 |background_task_runner_|를 재정의한다.
  void SetBackgroundTaskRunnerForTesting(
      scoped_refptr<base::SequencedTaskRunner> background_task_runner) {
    background_task_runner_ = std::move(background_task_runner);
  }

 private:
  scoped_refptr<base::SequencedTaskRunner> background_task_runner_ =
      base::ThreadPool::CreateSequencedTaskRunner(
          {base::MayBlock(), base::TaskPriority::BEST_EFFORT});
}
```

이 방식은 단위 테스트가 리프 계층을 직접 사용할 것이므로 //chrome과 해당 컴포넌트 사이의 모든 배관 계층을 제거하는 것을 여전히 가능하게 한다는 점에 유의하라.

## FAQ
더 많은 예제는 [스레딩과 태스크 FAQ](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks_faq.md)를 보라.

[task APIs v3]: https://docs.google.com/document/d/1tssusPykvx3g0gvbvU4HxGyn3MjJlIylnsH13-Tv6s4/edit?ts=5de99a52#heading=h.ss4tw38hvh3s

## 내부 구조

### SequenceManager

[SequenceManager](https://cs.chromium.org/chromium/src/base/task/sequence_manager/sequence_manager.h)는 서로 다른 속성, 예를 들어 우선순위나 공통 태스크 유형을 가진 TaskQueue들을 관리하며, 게시된 모든 태스크를 하나의 backing sequence로 multiplex한다. 이는 보통 MessagePump다. 사용되는 message pump의 유형에 따라 UI 메시지 같은 다른 이벤트도 처리될 수 있다. Windows에서는 시간이 허락하는 한 APC 호출과 등록된 HANDLE 집합으로 전송된 signal도 처리될 수 있다.

### MessagePump

[MessagePump](https://cs.chromium.org/chromium/src/base/message_loop/message_pump.h)는 native message를 처리하고 주기적으로 delegate(SequenceManager)에 cycle을 제공할 책임이 있다. MessagePump는 delegate callback과 native message 처리를 섞어 어느 유형의 이벤트도 cycle을 굶주리지 않도록 신경 쓴다.

서로 다른 [MessagePumpTypes](https://cs.chromium.org/chromium/src/base/message_loop/message_pump_type.h)가 있으며, 가장 일반적인 것은 다음과 같다.

* DEFAULT: 태스크와 타이머만 지원

* UI: native UI 이벤트, 예를 들어 Windows message 지원

* IO: 비동기 IO 지원(파일 I/O가 아니다!)

* CUSTOM: 사용자가 제공한 MessagePump 인터페이스 구현

### RunLoop

RunLoop는 현재 스레드에 연결된 RunLoop::Delegate, 보통 SequenceManager를 실행하기 위한 헬퍼 클래스다. 스택에 RunLoop를 만들고 Run/Quit를 호출해 중첩 RunLoop를 실행하라. 하지만 production code에서는 중첩 loop를 피하라!

### 태스크 재진입성

SequenceManager에는 태스크 재진입성 보호가 있다. 이는 태스크가 처리 중이라면 첫 번째 태스크가 끝날 때까지 두 번째 태스크가 시작될 수 없다는 뜻이다. 태스크를 처리하는 중 내부 message pump가 생성될 때 재진입이 일어날 수 있다. 그 내부 pump는 native message를 처리하고, 이 native message가 암묵적으로 내부 태스크를 시작할 수 있다. 내부 message pump는 dialog(DialogBox), common dialog(GetOpenFileName), OLE 함수(DoDragDrop), printer 함수(StartDoc) 및 *많은* 다른 것들에 의해 생성된다.

```cpp
내부 태스크 처리가 필요할 때의 샘플 우회 방법:
  HRESULT hr;
  {
    CurrentThread::ScopedAllowApplicationTasksInNativeNestedLoop allow;
    hr = DoDragDrop(...); // modal message loop를 암묵적으로 실행한다.
  }
  // |hr|을 처리한다(DoDragDrop()이 반환한 결과).
```

CurrentThread::ScopedAllowApplicationTasksInNativeNestedLoop를 사용하기 전에, 당신의 태스크가 재진입 가능(nestable)하고 모든 전역 변수가 안정적이며 접근 가능함을 반드시 확인하라.

## 일반 사용을 위한 API

사용자 코드는 SequenceManager API에 직접 접근할 필요가 거의 없어야 한다. 이 API들은 스케줄링을 다루는 코드를 위한 것이기 때문이다. 대신 다음을 사용해야 한다.

* base::RunLoop: SequenceManager가 바인딩된 스레드에서 이를 구동한다.

* base::Thread/SequencedTaskRunner::CurrentDefaultHandle: 그 위에서 실행 중인 태스크에서 SequenceManager TaskQueue로 다시 게시한다.

* SequenceLocalStorageSlot : 외부 상태를 시퀀스에 바인딩한다.

* base::CurrentThread : 현재 스레드에 바인딩된 Task 관련 API의 부분집합에 대한 proxy

* Embedder는 특정 loop에 태스크를 게시하기 위한 자체 static accessor를 제공할 수 있다. 예: content::BrowserThreads.

### SingleThreadTaskExecutor와 TaskEnvironment

SequenceManager와 TaskQueue를 직접 다루는 대신, 단순한 태스크 게시 환경, 즉 하나의 기본 태스크 큐가 필요한 코드는 [SingleThreadTaskExecutor](https://cs.chromium.org/chromium/src/base/task/single_thread_task_executor.h)를 사용할 수 있다.

단위 테스트는 매우 구성 가능한 [TaskEnvironment](https://cs.chromium.org/chromium/src/base/test/task_environment.h)를 사용할 수 있다.

## MessageLoop와 MessageLoopCurrent

코드나 문서에서 MessageLoop 또는 MessageLoopCurrent에 대한 참조를 마주칠 수 있다. 이 클래스들은 더 이상 존재하지 않으며, 우리는 이에 대한 모든 참조를 제거하는 과정에 있다. `base::MessageLoopCurrent`는 `base::CurrentThread`로 대체되었고, `base::MessageLoop`의 drop-in 대체물은 `base::SingleThreadTaskExecutor`와 `base::Test::TaskEnvironment`다.
