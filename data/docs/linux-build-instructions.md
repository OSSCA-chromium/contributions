---
title: Linux 빌드 안내
order: 34
group: 번역 · docs/linux
description: Linux에서 체크아웃·빌드하기
source_path: docs/linux/build_instructions.md
source_sha256: ed25beb1f3e75e1d146052a4c01b69c08cb33b3bd5fdb90b03de1fa11a0ba45e
translation_status: full
---
> 이 문서는 **Linux Build Instructions**([`docs/linux/build_instructions.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)) 문서의 한국어 전체 번역입니다.

다른 플랫폼에 대한 지침은 [코드 가져오기](https://chromium.googlesource.com/chromium/src/+/main/docs/get_the_code.md) 페이지에 링크되어 있습니다.

## Google 직원을 위한 지침

Google 직원인가요? 대신 [go/building-chrome](https://goto.google.com/building-chrome)을 보세요.


## 시스템 요구사항

* 최소 8GB RAM이 있는 x86-64 머신. 16GB 이상을 강력히 권장합니다. 머신에 SSD가 있다면 RAM이 각각 8GB/16GB인 머신에는 스왑을 \>=32GB/>=16GB로 두는 것을 권장합니다.
* 최소 100GB의 여유 디스크 공간. 같은 드라이브에 있을 필요는 없습니다. 빌드용으로 HDD에 약 50~80GB를 할당하세요.
* Git과 Python v3.9+가 이미 설치되어 있어야 합니다(그리고 `python3`는 Python v3.9+ 바이너리를 가리켜야 합니다). 시스템에 적절한 버전이 아직 없다면 Depot_tools가 `$depot_tools/python-bin`에 적절한 Python 버전을 번들로 제공합니다.
* Chromium의 빌드 인프라와 `depot_tools`는 현재 Python 3.11을 사용합니다. 더 오래된 Python 버전에서 무언가가 깨진다면, 자유롭게 신고하거나 수정 사항을 보내 주세요.
* 현재 지원되는 STL은 `libc++`뿐입니다. 공식적으로 지원되는 컴파일러는 `clang`뿐이지만, 외부 커뮤니티 구성원들이 일반적으로 `gcc`로도 빌드가 유지되도록 하고 있습니다. 자세한 내용은 [지원되는 툴체인 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/toolchain_support.md)를 보세요.

대부분의 개발은 Ubuntu에서 이루어집니다(Chromium의 빌드 인프라는 현재 22.04, Jammy Jellyfish에서 실행됩니다). 아래에 다른 배포판에 대한 일부 지침이 있지만, 대부분 지원되지 않습니다. 다만 설치 지침은 [Docker](#docker)에서 찾을 수 있습니다.

## `depot_tools` 설치

`depot_tools` 저장소를 클론하세요.

```shell
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

`depot_tools`를 `PATH`의 맨 앞에 추가하세요(아마 이것을 `~/.bashrc` 또는 `~/.zshrc`에 넣고 싶을 것입니다). `depot_tools`를 `/path/to/depot_tools`에 클론했다고 가정하면 다음과 같습니다.

```shell
$ export PATH="/path/to/depot_tools:$PATH"
```

`depot_tools`를 홈 디렉터리에 클론할 때는 `PATH`에서 **`~`를 사용하지 마세요**. 그렇지 않으면 `gclient runhooks` 실행에 실패합니다. 대신 `$HOME` 또는 절대 경로를 사용해야 합니다.

```shell
$ export PATH="${HOME}/depot_tools:$PATH"
```

## 코드 가져오기

체크아웃을 위한 `chromium` 디렉터리를 만들고 그 디렉터리로 이동하세요(전체 경로에 공백이 없기만 하면, 이름은 원하는 대로 붙이고 원하는 위치에 둘 수 있습니다).

```shell
$ mkdir ~/chromium && cd ~/chromium
```

depot_tools의 `fetch` 도구를 실행해 코드와 그 의존성을 체크아웃하세요.

```shell
$ fetch --nohooks chromium
```

*** note
**NixOS 사용자:** `fetch` 같은 도구는 Nix 셸 없이는 작동하지 않습니다. [도구 저장소](https://chromium.googlesource.com/chromium/src/tools)를 `git`으로 클론한 다음 `nix-shell tools/nix/shell.nix`를 실행하세요.
***

전체 저장소 이력이 필요 없다면 `fetch`에 `--no-history` 플래그를 추가해 많은 시간을 절약할 수 있습니다.

`fetch`에 `--git-cache`를 전달하면 훨씬 더 빠르게 만들 수 있습니다. 이 옵션은 처음부터 클론하는 대신 공유된 사전 빌드 스냅샷에서 체크아웃을 시드합니다(그리고 `--no-history`와 달리 전체 이력을 유지합니다).

```shell
$ fetch --git-cache chromium
```

캐시 디렉터리는 자동으로 선택됩니다(`$GIT_CACHE_PATH`로 재정의 가능). 이 디렉터리는 가져오는 모든 저장소를 미러링하며(Chromium의 경우 약 30GB), 머신의 모든 체크아웃이 공유합니다. 작업 트리는 객체를 복사하는 대신 이를 참조하므로, 체크아웃별 `.git`은 작게 유지됩니다.

명령은 빠른 연결에서도 30분 정도 걸릴 수 있으며, 느린 연결에서는 여러 시간이 걸릴 수 있습니다.

머신에 이미 빌드 의존성을 설치했다면(예: 다른 체크아웃에서), `--nohooks` 플래그를 생략할 수 있으며 `fetch`가 마지막에 자동으로 `gclient runhooks`를 실행합니다.

`fetch`가 완료되면 작업 디렉터리에 숨김 `.gclient` 파일과 `src`라는 디렉터리가 생성되어 있을 것입니다. 나머지 지침은 `src` 디렉터리로 이동했다고 가정합니다.

```shell
$ cd src
```

### 추가 빌드 의존성 설치

코드를 체크아웃했고 Ubuntu를 사용한다고 가정하면, [build/install-build-deps.sh](https://chromium.googlesource.com/chromium/src/+/main/build/install-build-deps.sh)를 실행하세요.

```shell
$ ./build/install-build-deps.sh
```

다른 배포판에서는 빌드 의존성을 조정해야 할 수도 있습니다. 이 문서 끝에 몇 가지 [참고 사항](#다른-배포판에-대한-참고-사항)이 있지만, 그 정확성은 보장하지 않습니다.

### 훅 실행

`install-build-deps`를 적어도 한 번 실행한 뒤에는 Chromium 전용 훅을 실행할 수 있습니다. 이 훅은 필요한 추가 바이너리와 기타 항목을 다운로드합니다.

```shell
$ gclient runhooks
```

*선택 사항*: 빌드가 일부 Google 서비스와 통신하도록 하고 싶다면 [API 키 설치](https://www.chromium.org/developers/how-tos/api-keys)도 할 수 있습니다. 하지만 대부분의 개발 및 테스트 목적에는 필요하지 않습니다.

## Git 작업 속도 높이기

거대한 Chromium 저장소에서 fsmonitor와 untrackedCache를 활성화하여 Git 작업을 가속하세요. 이렇게 하면 `git status` 등에서 시간이 크게 줄어듭니다(예: 약 3.1초에서 0.8초). 첫 실행은 인덱싱에 시간이 필요하다는 점에 유의하세요.

```shell
# If the following command fails, install watchman via one of the recommended
# methods listed on the installation page:
# https://facebook.github.io/watchman/docs/install
$ which watchman

$ cd ~/chromium/src

# Copy executable
$ cp .git/hooks/fsmonitor-watchman.sample ~/bin/query-watchman

# Enable optimization
$ git config core.untrackedCache true
$ git config core.fsmonitor $HOME/bin/query-watchman

# Let watchman ignore out. You should gitignore .watchmanconfig globally
$ echo '{ "ignore_dirs": ["out"] }' > .watchmanconfig

# Increase inotify parameters in case you hit the error like: `inotify:
# inotify_init: The user limit on the total number of inotify instances
# has been reached; increase the fs.inotify.max_user_instances sysctl`.
$ sudo vim /etc/sysctl.d/99-inotify.conf

# Add the following.
fs.inotify.max_user_instances = 8192
fs.inotify.max_user_watches = 10485760

# Then apply the change.
$ sudo sysctl --system

# (optional) `git add -A` is still slow, so create an alias that does the
# same but faster. Update ~/.bashrc (or ~/.zshrc or whatever) and add:
alias gaa="git status --porcelain | awk '{print \$2}' | xargs -r git add"
```

## 빌드 설정

Chromium은 `.ninja` 파일을 생성하기 위해 [Siso](https://pkg.go.dev/go.chromium.org/build/siso#section-readme)를 주 빌드 도구로 사용하고, [GN](https://gn.googlesource.com/gn/+/main/docs/quick_start.md)이라는 도구와 함께 사용합니다. 서로 다른 설정으로 원하는 수의 *빌드 디렉터리*를 만들 수 있습니다. 빌드 디렉터리를 만들려면 다음을 실행하세요.

```shell
$ gn gen out/Default
```

* 새 빌드 디렉터리마다 이 작업은 한 번만 실행하면 됩니다. Siso가 필요에 따라 빌드 파일을 업데이트합니다.
* `Default`를 다른 이름으로 바꿀 수 있지만, `out`의 하위 디렉터리여야 합니다.
* 릴리스 설정을 포함한 다른 빌드 인수는 [GN 빌드 구성](https://www.chromium.org/developers/gn-build-configuration)을 보세요. 기본값은 현재 호스트 운영체제와 CPU에 맞는 디버그 컴포넌트 빌드입니다.
* GN에 대한 자세한 내용은 명령줄에서 `gn help`를 실행하거나 [빠른 시작 가이드](https://gn.googlesource.com/gn/+/main/docs/quick_start.md)를 읽으세요.

### 더 빠른 빌드

이 섹션에는 빌드 속도를 높이기 위해 변경할 수 있는 몇 가지 항목이 들어 있으며, 가장 큰 차이를 만드는 항목이 먼저 오도록 정렬되어 있습니다.

#### 원격 실행 사용

*** note
**경고:** Google 직원이라면 아래 지침을 따르지 마세요. 대신 [go/chrome-linux-build#set-up-remote-execution](https://goto.google.com/chrome-linux-build#set-up-remote-execution)을 보세요.
***

Chromium 빌드는 [REAPI](https://github.com/bazelbuild/remote-apis)와 호환되는 원격 실행 시스템을 사용하여 상당히 빨라질 수 있습니다. 이를 통해 원격 캐싱의 이점을 얻고 공유 워커 클러스터에서 많은 빌드 액션을 병렬로 실행할 수 있습니다. Chromium 빌드는 빌드 액션을 원격으로 실행하기 위해 Google이 개발한 [Siso](https://pkg.go.dev/go.chromium.org/build/siso#section-readme)라는 클라이언트를 사용합니다.

시작하려면 REAPI 호환 백엔드에 접근할 수 있어야 합니다.

##### Google RBE

다음 지침은 Google로부터 Chromium의 Google RBE 서비스를 사용하라는 초대를 받았고 그 서비스에 대한 접근 권한을 부여받았다고 가정합니다. 그렇지 않다면 대신 [non Google RBE](#non-google-rbe)를 보세요.

[tryjob 접근 권한](https://www.chromium.org/getting-involved/become-a-committer/#try-job-access)이 있는 기여자는 Google이 비용을 지불하는 RBE 백엔드에 접근할 수 있도록 Googler에게 대신 accounts@chromium.org로 이메일을 보내 달라고 요청하세요. 외부 기여자를 위한 원격 실행은 최선 노력(best-effort) 방식이라는 점에 유의하세요. 언제 초대될지는 보장하지 않습니다.

Google의 RBE와 함께 `siso`를 사용하려면 먼저 다음을 해야 합니다.

1. `siso login`을 실행하고 권한이 부여된 계정으로 로그인합니다. OAuth2 흐름에서 차단된다면 `gcloud auth login`을 실행하세요(siso v1.3.12부터는 환경 변수 `SISO_CREDENTIAL_HELPER=gcloud`도 export).

다음으로, Chromium 기여자에게 맞는 올바른 인스턴스를 사용하도록 `.gclient` 구성에 `rbe_instance`를 지정해야 합니다.

*** note
**경고:** Google 직원이라면 아래 지침을 따르지 마세요. 대신 [go/chrome-linux-build#set-up-remote-execution](https://goto.google.com/chrome-linux-build#set-up-remote-execution)을 보세요.
***

```
solutions = [
  {
    ...,
    "custom_vars": {
      # This is the correct instance name for using Chromium's RBE service.
      # You can only use it if you were granted access to it. If you use your
      # own REAPI-compatible backend, you will need to set reapi_address,
      # reapi_instance and reapi_backend_config_path instead.
      # see [non Google RBE](#non-google-rbe) below.
      "rbe_instance": "projects/rbe-chromium-untrusted/instances/default_instance",
    },
  },
]
```

그리고 `gclient sync`를 실행하세요. 그러면 방금 `.gclient` 파일에 추가한 Google RBE를 사용하도록 `build/config/siso/.sisoenv`와 `build/config/siso/backend_config/backend.star`의 구성 파일이 다시 생성됩니다.

##### non Google RBE

Google의 RBE 백엔드에 접근할 수 없는 다른 사용자는 [다른 호환 백엔드](https://github.com/bazelbuild/remote-apis#servers) 중 어떤 것이든 사용할 수 있습니다. 이 경우 인증 방법, 인스턴스 이름 등에 관한 다음 지침을 자신의 백엔드에 맞게 조정해야 합니다.

- 폐쇄망이고 인증이 없다면 환경 변수 `RBE_service_no_security=true`를 export하세요.
- mTLS를 사용한다면 환경 변수 `RBE_tls_client_auth_key`와 `RBE_tls_client_auth_cert`를 export하세요.
- Google OAuth2를 사용한다면 `gcloud`를 사용할 수 있습니다. `gcloud auth login`을 실행하세요(siso v1.3.12부터는 환경 변수 `SISO_CREDENTIAL_HELPER=gcloud`도 export).
- 그렇지 않으면 자체 [credential helper](https://github.com/EngFlow/credential-helper-spec/blob/main/spec.md)를 사용해야 할 수도 있습니다. 환경 변수 `SISO_CREDENTIAL_HELPER=/path/to/your/credhelper`를 export하세요.

Google RBE가 아닌 자체 REAPI 백엔드의 경우 자체 backend.star를 준비해야 합니다.

예: 큰 워커 풀이 없는 백엔드의 경우
```
load("@builtin//struct.star", "module")

def __platform_properties(ctx):
    # fyi: this image is created by
    # https://chromium.googlesource.com/infra/infra/+/refs/heads/main/rbe/images/siso-chromium/linux/Dockerfile
    container_image = "docker://gcr.io/chops-public-images-prod/rbe/siso-chromium/linux@sha256:d7cb1ab14a0f20aa669c23f22c15a9dead761dcac19f43985bf9dd5f41fbef3a"
    return {
        "default": {
            # set platform properties for your worker.
            # it depends on how you configure your workers.
            "OSFamily": "Linux",
            "container-image": container_image,
            # e.g. to use worker in worker pool "linux_x64".
            # "Pool": "linux_x64",
        },
        # no Large workers. empty platform properties will run locally.
        "large": {},
    }

backend = module(
    "backend",
    platform_properties = __platform_properties,
)
```
[build/config/siso/backend_config/README.md](https://chromium.googlesource.com/chromium/src/+/main/build/config/siso/backend_config/README.md), [remote apis platform lexicon](https://github.com/bazelbuild/remote-apis/blob/main/build/bazel/remote/execution/v2/platform.md)을 보세요. 또한 사용 중인 REAPI 문서도 확인하세요.

위의 backend.star에 대한 경로 이름인 `reapi_address`, `reapi_instance`, `reapi_backend_config_path`를 설정하세요.

```
solutions = [
  {
    "custom_vars": {
      "reapi_instance": "default", # your instance name
      "reapi_address": "remotebuild.example.com:443",  # your backend address
      "reapi_backend_config_path": "/path/to/your/backend.star",
    },
  }
]
```

그리고 `gclient sync`를 실행하세요. 그러면 방금 `.gclient` 파일에 추가한 REAPI 인스턴스를 사용하도록 `build/config/siso/.sisoenv`와 `build/config/siso/backend_config/backend.star`의 구성 파일이 다시 생성됩니다.

팁: reapi 접근을 위한 연결 풀을 제한하기 위해 `--reapi_grpc_conn_pool=1` 같은 값을 사용하고 싶을 수 있습니다.

팁: 백엔드가 grpc 스트림이 취소되거나 닫힐 때 액션을 종료하고 WaitExecution과 함께 작동하지 않는다면 `--reapi_keep_exec_stream`을 사용하고 싶을 수 있습니다.

팁: 다음과 같이 이 플래그들을 `build/config/siso/.sisorc`에 넣을 수 있습니다.

```shell
ninja --reapi_grpc_conn_pool=1 --reapi_keep_exec_stream
```
그러면 siso가 `siso ninja` 또는 `autoninja`에 이 플래그들을 사용합니다.

##### 원격 실행을 위한 gn 설정

그런 다음 `args.gn`에 다음 GN 인수를 추가하세요.

```
use_remoteexec = true
use_siso = true
```

`args.gn`에 `use_reclient=true`가 들어 있다면 제거하거나 `use_reclient=false`로 바꾸세요.

이것으로 끝입니다. 아래에 설명된 것처럼 Chromium을 빌드할 때는 항상 `siso`나 `ninja`를 직접 호출하지 말고 `autoninja`를 사용해야 한다는 점을 기억하세요.

원격 실행 사용에 대해 질문이 있으면 [build@chromium.org](https://groups.google.com/a/chromium.org/g/build)에 문의하세요.

#### 디버그 심볼을 더 적게 포함하기

기본적으로 GN은 모든 디버그 assertion이 활성화된(`is_debug=true`) 빌드를 만들고 전체 디버그 정보(`symbol_level=2`)를 포함합니다. `symbol_level=1`로 설정하면 스택 트레이스에는 충분하지만 줄 단위 디버깅에는 부족한 정보를 생성합니다. `symbol_level=0`으로 설정하면 디버그 심볼을 전혀 포함하지 않습니다. 어느 쪽이든 전체 심볼보다 빌드가 빨라집니다.

#### Blink와 v8의 디버그 심볼 비활성화

템플릿을 광범위하게 사용하기 때문에 Blink 코드는 우리 디버그 심볼의 약 절반을 생성합니다. Blink를 디버그할 필요가 전혀 없다면 GN 인수 `blink_symbol_level=0`을 설정할 수 있습니다. 마찬가지로 v8을 디버그할 필요가 없다면 GN 인수 `v8_symbol_level=0`을 설정하여 빌드 속도를 개선할 수 있습니다.

#### Icecc 사용

[Icecc](https://github.com/icecc/icecream)는 중앙 스케줄러를 통해 빌드 부하를 공유하는 분산 컴파일러입니다. 현재 많은 외부 기여자가 이를 사용합니다. 예: Intel, Opera, Samsung(Siso를 사용하고 있다면 유용하지 않습니다).

`icecc`를 사용하려면 다음 GN 인수를 설정하세요.

```
use_debug_fission=false
is_clang=false
```

[bundled_binutils 제한](https://github.com/icecc/icecream/commit/b2ce5b9cc4bd1900f55c3684214e409fa81e7a92), [debug fission 제한](http://gcc.gnu.org/wiki/DebugFission)에 대한 자세한 내용은 이 링크들을 보세요.

glibc 2.21 이상을 사용할 때는 시스템 링커를 사용하는 것도 필요할 수 있습니다. [관련 버그](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=808181)를 보세요.

#### ccache

[ccache](https://ccache.dev)를 사용하여 로컬 빌드 속도를 높일 수 있습니다(역시 Siso를 사용 중이라면 유용하지 않습니다).

작업 디렉터리들이 공통으로 갖는 상위 디렉터리(예: `/home/yourusername/development`)로 `CCACHE_BASEDIR`를 설정하여 ccache 히트율을 높이세요. `CCACHE_SLOPPINESS=include_file_mtime` 사용을 고려하세요(여러 작업 디렉터리를 사용하는 경우, 트리의 svn sync된 부분에서 헤더 시간이 서로 다를 것이기 때문입니다. 추가 정보는 [ccache 문제 해결 섹션](https://ccache.dev/manual/latest.html#_troubleshooting)을 보세요). 홈 디렉터리에서 로컬 물리 디스크 디렉터리로 향하는 심볼릭 링크를 사용해 작업 개발 디렉터리에 접근한다면, 다음을 `.bashrc`에 넣는 것을 고려하세요.

```
alias cd="cd -P"
```

그러면 `$PWD` 또는 `cwd`가 항상 논리 디렉터리가 아니라 물리 디렉터리를 가리키게 됩니다(그리고 `CCACHE_BASEDIR`도 물리 상위 디렉터리를 가리키는지 확인하세요).

ccache를 올바르게 튜닝하면, trunk를 추적하는 브랜치를 사용하고 trunk에 최신 상태이며 거의 같은 시점에 gclient sync된 두 번째 작업 디렉터리는 약 1/3 시간 안에 chrome을 빌드할 수 있어야 하며, `ccache -s`가 보고하는 캐시 미스는 거의 증가하지 않아야 합니다.

이는 [git-worktree](http://git-scm.com/docs/git-worktree)를 사용하고 여러 로컬 작업 디렉터리를 동시에 유지하는 경우 특히 유용합니다.

#### tmpfs 사용

빌드 출력에 tmpfs를 사용하여 필요한 디스크 쓰기 양을 줄일 수 있습니다. 즉, 빌드 출력이 들어가는 출력 디렉터리에 tmpfs를 마운트합니다.

root로 실행:
```
mount -t tmpfs -o size=20G,nr_inodes=40k,mode=1777 tmpfs /path/to/out
```

*** note
**주의:** tmpfs를 뒷받침할 만큼 충분한 RAM + 스왑이 필요합니다. 전체 디버그 빌드의 경우 약 20GB가 필요합니다. chrome 타깃만 빌드하거나 릴리스 빌드의 경우 더 적게 필요합니다.
***

HP Z600(Intel core i7, 하이퍼스레딩된 16코어, 12GB RAM)에서의 빠르고 대략적인 벤치마크 수치

* tmpfs 사용:
  * 12m:20s
* tmpfs 미사용
  * 15m:40s

### 더 작은 빌드

Chrome 바이너리는 기본적으로 내장 심볼을 포함합니다. Linux `strip` 명령을 사용해 이 디버그 정보를 제거하면 크기를 줄일 수 있습니다. 또한 GN 인수 `is_official_build = true`로 공식 빌드 모드를 활성화하면 바이너리 크기를 줄이고 모든 최적화를 켤 수 있습니다.

## Chromium 빌드

다음 명령으로 Siso 또는 Ninja를 사용해 Chromium("chrome" 타깃)을 빌드하세요.

```shell
$ autoninja -C out/Default chrome
```

(`autoninja`는 `siso` 또는 `ninja`에 전달되는 인수에 대해 최적 값을 자동으로 제공하는 래퍼입니다.)

명령줄에서 `gn ls out/Default`를 실행하면 GN의 다른 모든 빌드 타깃 목록을 얻을 수 있습니다. 하나를 컴파일하려면 앞의 "//" 없이 GN 레이블을 Siso/Ninja에 전달하세요(예: `//chrome/test:unit_tests`의 경우 `autoninja -C out/Default chrome/test:unit_tests` 사용).

팁: [Siso 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/siso_tips.md)을 보세요.

## Chromium 실행

빌드가 끝나면 브라우저를 간단히 실행할 수 있습니다.

```shell
$ out/Default/chrome
```

Chrome Remote Desktop을 지원하는 원격 머신을 사용 중이라면 이것을 .bashrc / .bash_profile에 추가할 수 있습니다.

```shell
if [[ -z "${DISPLAY}" ]]; then
  # In reality, Chrome Remote Desktop starts with 20 and increases until it
  # finds an available ID [1]. So this isn't guaranteed to always work, but
  # should work on the vast majoriy of cases.
  #
  # [1] https://source.chromium.org/chromium/chromium/src/+/main:remoting/host/linux/linux_me2me_host.py;l=112;drc=464a632e21bcec76c743930d4db8556613e21fd8
  export DISPLAY=:20
fi
```

이는 SSH 세션에서 Chrome을 실행하면 UI 출력이 Chrome Remote Desktop에서 사용 가능해진다는 뜻입니다.

## 테스트 타깃 실행

테스트는 타입과 디렉터리 구조에서 존재하는 위치에 따라 여러 테스트 타깃으로 나뉩니다. 특정 단위 테스트 또는 브라우저 테스트 파일이 어떤 타깃에 해당하는지 보려면 다음 명령을 사용할 수 있습니다.

```shell
$ gn refs out/Default --testonly=true --type=executable --all chrome/browser/ui/browser_unittest.cc
//chrome/test:unit_tests
```

위 예에서 타깃은 unit_tests입니다. unit_tests 바이너리는 다음 명령을 실행해 빌드할 수 있습니다.

```shell
$ autoninja -C out/Default unit_tests
```

unit_tests 바이너리를 실행하여 테스트를 실행할 수 있습니다. 또한 `--gtest_filter` 인수를 사용해 어떤 테스트를 실행할지 제한할 수도 있습니다. 예:

```shell
$ out/Default/unit_tests --gtest_filter="BrowserListUnitTest.*"
```

GoogleTest에 대한 자세한 내용은 [GitHub 페이지](https://github.com/google/googletest)에서 확인할 수 있습니다.

## 체크아웃 업데이트

기존 체크아웃을 업데이트하려면 다음을 실행할 수 있습니다.

```shell
$ git rebase-update
$ gclient sync
```

첫 번째 명령은 기본 Chromium 소스 저장소를 업데이트하고 로컬 브랜치를 tip-of-tree(일명 Git 브랜치 `origin/main`) 위로 rebase합니다. 이 스크립트를 사용하고 싶지 않다면 `git pull` 또는 다른 일반적인 Git 명령을 사용해 저장소를 업데이트해도 됩니다.

두 번째 명령은 의존성을 적절한 버전으로 동기화하고 필요에 따라 훅을 다시 실행합니다.

## 팁, 트릭, 문제 해결

### 링커 크래시

최종 링크 단계에서 다음과 같은 상황일 때:

```
LINK out/Debug/chrome
```

다음과 같은 오류가 발생하면:

```
collect2: ld terminated with signal 6 Aborted terminate called after throwing an instance of 'std::bad_alloc'
collect2: ld terminated with signal 11 [Segmentation fault], core dumped
```

또는:

```
LLVM ERROR: out of memory
```

링크 중 메모리가 부족할 가능성이 높습니다. 빌드하려면 64비트 시스템을 *반드시* 사용해야 합니다. 다음 빌드 설정을 시도해 보세요(다른 설정은 [GN 빌드 구성](https://www.chromium.org/developers/gn-build-configuration)을 보세요).

* 릴리스 모드로 빌드(디버깅 심볼은 더 많은 메모리를 요구합니다):
    `is_debug = false`
* 심볼 끄기: `symbol_level = 0`
* 컴포넌트 모드로 빌드(개발 전용이며, 더 느리고 기능이 깨질 수 있습니다): `is_component_build = true`
* Linux에서 공식(ThinLTO) 빌드를 하는 경우 vm.max_map_count 커널 파라미터를 늘리세요. `vm.max_map_count` 값을 기본값(예: 65530)에서 예를 들어 262144로 늘리세요. 현재 세션에서 셸로 `sudo sysctl -w vm.max_map_count=262144` 명령을 실행해 설정할 수 있고, 영구 저장하려면 `/etc/sysctl.conf`에 `vm.max_map_count=262144`를 추가할 수 있습니다.

### 더 많은 링크

* [Clang으로 빌드하기](https://chromium.googlesource.com/chromium/src/+/main/docs/clang.md)에 대한 정보.
* 버전 관리 또는 패키징 충돌로부터 자신을 격리하기 위해 [chroot 사용](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/using_a_chroot.md)을 원할 수 있습니다.
* ARM용 크로스 컴파일을 하나요? [LinuxChromiumArm](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/chromium_arm.md)을 보세요.
* Eclipse를 IDE로 사용하고 싶나요? [LinuxEclipseDev](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/eclipse_dev.md)를 보세요.
* 직접 빌드한 버전을 기본 브라우저로 사용하고 싶나요? [LinuxDevBuildAsDefaultBrowser](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/dev_build_as_default_browser.md)를 보세요.

## 다음 단계

Linux용 Chromium 기반 브라우저를 위한 노력에 기여하고 싶다면, 자세한 정보는 [Linux 개발 페이지](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/development.md)를 확인하세요.

## 다른 배포판에 대한 참고 사항

### Arch Linux

빌드 의존성을 설치하기 위해 `install-build-deps.sh`를 실행하는 대신 다음을 실행하세요.

```shell
$ sudo pacman -S --needed python perl gcc gcc-libs bison flex gperf pkgconfig \
nss alsa-lib glib2 gtk3 nspr freetype2 cairo dbus xorg-server-xvfb \
xorg-xdpyinfo
```

Arch Linux의 선택 패키지:

* `php-cgi`는 `pacman`으로 제공됩니다.
* `wdiff`는 메인 저장소에 없지만 `dwdiff`가 있습니다. `wdiff`는 AUR/`yaourt`에서 얻을 수 있습니다.

### Crostini(Debian 기반)

먼저 스크립트가 제대로 실행되도록 `file`과 `lsb-release` 명령을 설치하세요.

```shell
$ sudo apt-get install file lsb-release
```

그런 다음 이 구성에는 ARM 툴체인이 없으므로 `--no-arm` 인수와 함께 install-build-deps.sh를 호출하세요.

```shell
$ sudo install-build-deps.sh --no-arm
```

### Fedora

`build/install-build-deps.sh`를 실행하는 대신 다음을 실행하세요.

```shell
su -c 'yum install git python bzip2 tar pkgconfig atk-devel alsa-lib-devel \
bison binutils brlapi-devel bluez-libs-devel bzip2-devel cairo-devel \
cups-devel dbus-devel dbus-glib-devel expat-devel fontconfig-devel \
freetype-devel gcc-c++ glib2-devel glibc.i686 gperf glib2-devel \
gtk3-devel java-1.*.0-openjdk-devel libatomic libcap-devel libffi-devel \
libgcc.i686 libjpeg-devel libstdc++.i686 libX11-devel libXScrnSaver-devel \
libXtst-devel libxkbcommon-x11-devel ncurses-compat-libs nspr-devel nss-devel \
pam-devel pango-devel pciutils-devel pulseaudio-libs-devel zlib.i686 httpd \
mod_ssl php php-cli python-psutil wdiff xorg-x11-server-Xvfb'
```

Blink의 웹 테스트에 필요한 글꼴은 [이 지침](https://gist.github.com/pwnall/32a3b11c2b10f6ae5c6a6de66c1e12ae)을 따르면 얻을 수 있습니다. 선택 패키지의 경우:

* `php-cgi`는 `php-cli` 패키지가 제공합니다.
* `sun-java6-fonts`는 위에 링크된 지침으로 처리됩니다.

### Gentoo

그냥 `emerge www-client/chromium`을 실행하면 됩니다.

### NixOS

개발 환경이 있는 셸을 얻으려면:

```sh
$ nix-shell tools/nix/shell.nix
```

개발 환경에서 명령을 실행하려면:

```sh
$ NIX_SHELL_RUN='autoninja -C out/Default chrome' nix-shell tools/nix/shell.nix
```

원격 인덱싱 지원이 있는 clangd를 설정하려면 아래 명령을 실행한 다음 경로를 편집기 설정에 복사하세요.

```sh
$ NIX_SHELL_RUN='readlink /usr/bin/clangd' nix-shell tools/nix/shell.nix
```

### OpenSUSE

의존성을 설치하려면 `zypper` 명령을 사용하세요.

(openSUSE 11.1 이상)

```shell
sudo zypper in subversion pkg-config python perl bison flex gperf \
     mozilla-nss-devel glib2-devel gtk-devel wdiff lighttpd gcc gcc-c++ \
     mozilla-nspr mozilla-nspr-devel php5-fastcgi alsa-devel libexpat-devel \
     libjpeg-devel libbz2-devel
```

11.0의 경우 `mozilla-nspr`와 `mozilla-nspr-devel` 대신 `libnspr4-0d`와 `libnspr4-dev`를 사용하고, `php5-fastcgi` 대신 `php5-cgi`를 사용하세요.

(openSUSE 11.0)

```shell
sudo zypper in subversion pkg-config python perl \
     bison flex gperf mozilla-nss-devel glib2-devel gtk-devel \
     libnspr4-0d libnspr4-dev wdiff lighttpd gcc gcc-c++ libexpat-devel \
     php5-cgi alsa-devel gtk3-devel jpeg-devel
```

Ubuntu 패키지 `sun-java6-fonts`에는 사용되는 글꼴 중 Java 글꼴의 일부가 들어 있습니다. 이 패키지는 어차피 Java를 전제 조건으로 요구하므로, 동등한 openSUSE Sun Java 패키지를 설치해 같은 일을 할 수 있습니다.

```shell
sudo zypper in java-1_6_0-sun
```

WebKit은 현재 Microsoft 글꼴에 하드 링크되어 있습니다. `zypper`를 사용해 이를 설치하려면:

```shell
sudo zypper in fetchmsttfonts pullin-msttf-fonts
```

위에서 설치한 글꼴은 Ubuntu용으로 경로가 하드코딩되어 있으므로, 작동하게 하려면 적절한 위치로 심볼릭 링크를 만드세요.

```shell
sudo mkdir -p /usr/share/fonts/truetype/msttcorefonts
sudo ln -s /usr/share/fonts/truetype/arial.ttf /usr/share/fonts/truetype/msttcorefonts/Arial.ttf
sudo ln -s /usr/share/fonts/truetype/arialbd.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/arialbi.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/ariali.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/comic.ttf /usr/share/fonts/truetype/msttcorefonts/Comic_Sans_MS.ttf
sudo ln -s /usr/share/fonts/truetype/comicbd.ttf /usr/share/fonts/truetype/msttcorefonts/Comic_Sans_MS_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/cour.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New.ttf
sudo ln -s /usr/share/fonts/truetype/courbd.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/courbi.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/couri.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/impact.ttf /usr/share/fonts/truetype/msttcorefonts/Impact.ttf
sudo ln -s /usr/share/fonts/truetype/times.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf
sudo ln -s /usr/share/fonts/truetype/timesbd.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/timesbi.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/timesi.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/verdana.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana.ttf
sudo ln -s /usr/share/fonts/truetype/verdanab.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/verdanai.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/verdanaz.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Bold_Italic.ttf
```

Ubuntu 패키지 `sun-java6-fonts`에는 사용되는 글꼴 중 Java 글꼴의 일부가 들어 있습니다. 이 패키지는 어차피 Java를 전제 조건으로 요구하므로, 동등한 openSUSE Sun Java 패키지를 설치해 같은 일을 할 수 있습니다.

```shell
sudo zypper in java-1_6_0-sun
```

WebKit은 현재 Microsoft 글꼴에 하드 링크되어 있습니다. `zypper`를 사용해 이를 설치하려면:

```shell
sudo zypper in fetchmsttfonts pullin-msttf-fonts
```

위에서 설치한 글꼴은 Ubuntu용으로 경로가 하드코딩되어 있으므로, 작동하게 하려면 적절한 위치로 심볼릭 링크를 만드세요.

```shell
sudo mkdir -p /usr/share/fonts/truetype/msttcorefonts
sudo ln -s /usr/share/fonts/truetype/arial.ttf /usr/share/fonts/truetype/msttcorefonts/Arial.ttf
sudo ln -s /usr/share/fonts/truetype/arialbd.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/arialbi.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/ariali.ttf /usr/share/fonts/truetype/msttcorefonts/Arial_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/comic.ttf /usr/share/fonts/truetype/msttcorefonts/Comic_Sans_MS.ttf
sudo ln -s /usr/share/fonts/truetype/comicbd.ttf /usr/share/fonts/truetype/msttcorefonts/Comic_Sans_MS_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/cour.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New.ttf
sudo ln -s /usr/share/fonts/truetype/courbd.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/courbi.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/couri.ttf /usr/share/fonts/truetype/msttcorefonts/Courier_New_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/impact.ttf /usr/share/fonts/truetype/msttcorefonts/Impact.ttf
sudo ln -s /usr/share/fonts/truetype/times.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf
sudo ln -s /usr/share/fonts/truetype/timesbd.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/timesbi.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/timesi.ttf /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/verdana.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana.ttf
sudo ln -s /usr/share/fonts/truetype/verdanab.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Bold.ttf
sudo ln -s /usr/share/fonts/truetype/verdanai.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Italic.ttf
sudo ln -s /usr/share/fonts/truetype/verdanaz.ttf /usr/share/fonts/truetype/msttcorefonts/Verdana_Bold_Italic.ttf
```

그리고 Java 글꼴에 대해서는 다음을 실행하세요.

```shell
sudo mkdir -p /usr/share/fonts/truetype/ttf-lucida
sudo find /usr/lib*/jvm/java-1.6.*-sun-*/jre/lib -iname '*.ttf' -print \
     -exec ln -s {} /usr/share/fonts/truetype/ttf-lucida \;
```

### Docker

#### 전제 조건

일반적인 설정은 아니지만, Docker 컨테이너 안에서 Chromium 컴파일이 작동해야 합니다. 어떤 이유로든 컨테이너 안에서 컴파일하기로 선택했다면 다음 도구를 사용할 수 있는지 확인해야 합니다.

* `curl`
* `git`
* `lsb_release`
* `python3`
* `sudo`
* `file`

컴파일 중 Docker 관련 추가 문제가 있을 수 있습니다. 이에 대한 자세한 내용은 [이 버그](https://crbug.com/1377520)를 보세요.

참고: 먼저 [depot_tools 클론](#depot_tools-설치)을 하세요.

#### 빌드 단계

1. 다음 Dockerfile을 `/path/to/chromium/`에 넣으세요.

```docker
# Use an official Ubuntu base image with Docker already installed
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install Mantatory tools (curl git python3) and optional tools (vim sudo)
RUN apt-get update && \
    apt-get install -y curl git lsb-release python3 git file vim sudo && \
    rm -rf /var/lib/apt/lists/*

# Export depot_tools path
ENV PATH="/depot_tools:${PATH}"

# Configure git for safe.directory
RUN git config --global --add safe.directory /depot_tools && \
    git config --global --add safe.directory /chromium/src

# Set the working directory to the existing Chromium source directory.
# This can be either "/chromium/src" or "/chromium".
WORKDIR /chromium/src

# Expose any necessary ports (if needed)
# EXPOSE 8080

# Create a dummy user and group to avoid permission issues
RUN groupadd -g 1001 chrom-d && \
    useradd -u 1000 -g 1001 -m chrom-d

# Create normal user with name "chrom-d". Optional and you can use root but
# not advised.
USER chrom-d

# Start Chromium Builder "chrom-d" (modify this command as needed)
# CMD ["autoninja -C out/Default chrome"]
CMD ["bash"]
```

2. 컨테이너 빌드

```shell
# chrom-b is just a name; You can change it but you must reflect the renaming
# in all commands below
$ docker build -t chrom-b .
```

3. 의존성 설치를 위해 root로 컨테이너 실행

```shell
$ docker run
  -it \ # Run docker interactively
  --name chrom-b \ # with name "chrom-b"
  -u root \ # with user root
  -v /path/on/machine/to/chromium:/chromium \ # With chromium folder mounted
  -v /path/on/machine/to/depot_tools:/depot_tools \ # With depot_tools mounted
  chrom-b # Run container with image name "chrom-b"
```

*** note
**참고:** bash에서 명령을 한 줄로 실행할 때는 명령이 깨지지 않도록 주석(`#` 뒤)을 제거하세요.
***

4. 의존성 설치:

```shell
./build/install-build-deps.sh
```

5. [훅 실행](#훅-실행)(Docker 안에서 또는 머신에 depot_tools를 설치했다면 머신에서)

*** note
**훅을 실행하기 전:** `third_party` 안의 모든 디렉터리가 Git의 safe directory로 추가되어 있는지 확인하세요. 컨테이너에서 실행할 때 `src/` 디렉터리의 소유자(예: `chrom-b`)가 현재 사용자(예: `root`)와 다르기 때문에 필요합니다. "dubious ownership"에 대한 Git **경고**를 방지하려면 의존성을 설치한 뒤 다음 명령을 실행하세요.

```shell
# Loop through each directory in /chromium/src/third_party and add
# them as safe directories in Git
$ for dir in /chromium/src/third_party/*; do
    if [ -d "$dir" ]; then
        git config --global --add safe.directory "$dir"
    fi
done
```
***

6. 컨테이너 종료

7. 태그 ID 이름 `dpv1.0`으로 컨테이너 이미지를 저장하세요. 컨테이너 안이 아니라 머신에서 이것을 실행하세요.

```shell
# Get docker running/stopped containers, copy the "chrom-b" id
$ docker container ls -a
# Save/tag running docker container with name "chrom-b" with "dpv1.0"
# You can choose any tag name you want but propagate name accordingly
# You will need to create new tags when working on different parts of
# chromium which requires installing additional dependencies
$ docker commit <ID from above step> chrom-b:dpv1.0
# Optional, just saves space by deleting unnecessary images
$ docker image rmi chrom-b:latest && docker image prune \
  && docker container prune && docker builder prune
```

#### 컨테이너 실행

```shell
$ docker run --rm \ # close instance upon exit
  -it \ # Run docker interactively
  --name chrom-b \ # with name "chrom-b"
  -u $(id -u):$(id -g) \ # Run container as a non-root user with same UID & GID
  -v /path/on/machine/to/chromium:/chromium \ # With chromium folder mounted
  -v /path/on/machine/to/depot_tools:/depot_tools \ # With depot_tools mounted
  chrom-b:dpv1.0 # Run container with image name "chrom-b" and tag dpv1.0
```

*** note
**참고:** bash에서 명령을 한 줄로 실행할 때는 명령이 깨지지 않도록 주석(`#` 뒤)을 제거하세요.
***
