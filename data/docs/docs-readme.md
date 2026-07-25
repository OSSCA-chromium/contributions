---
title: Chromium 문서
order: 20
group: 번역 · docs
description: Chromium 공식 문서 개요와 목차
source_path: docs/README.md
source_sha256: f04d6eb7af268cf53bd4e973df0131a603243ac977768a034a49cc9c391f7746
translation_status: full
---
> 이 문서는 **Chromium Docs README**([`docs/README.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/README.md)) 문서의 한국어 전체 번역입니다.

이 디렉터리에는 [chromium 프로젝트](https://www.chromium.org/Home/)
문서가 [Gitiles-flavored Markdown] 형식으로 들어 있습니다. 이 문서는 자동으로
[Gitiles에 의해 렌더링됩니다].

[Gitiles-flavored Markdown]: https://gerrit.googlesource.com/gitiles/+/master/Documentation/markdown.md
[Gitiles에 의해 렌더링됩니다]: https://chromium.googlesource.com/chromium/src/+/main/docs/

**새 문서를 추가하는 경우, 아래 문서 색인에도 해당 문서로 가는 링크를 추가해 주세요.**


## 문서 작성하기

### 지침

*   [Chromium 문서화 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/documentation_guidelines.md) 및
    [Chromium 문서화 모범 사례](https://chromium.googlesource.com/chromium/src/+/main/docs/documentation_best_practices.md)를 참고하세요.
*   Markdown 문서는
    [Markdown 스타일
    가이드](https://chromium.googlesource.com/chromium/src/+/HEAD/styleguide/markdown/markdown.md)를 따라야 합니다.

### 변경 사항 미리 보기

#### 로컬에서 [md_browser](https://chromium.googlesource.com/chromium/src/+/main/tools/md_browser/) 사용

```bash
# chromium 체크아웃 안에서
./tools/md_browser/md_browser.py
```

이는 어디까지나 추정치입니다. **gitiles** 보기는 다를 수 있습니다.

#### Gerrit의 gitiles 링크를 통해 온라인에서

1.  패치를 gerrit에 업로드하거나, 리뷰 요청을 받습니다.
    예: https://chromium-review.googlesource.com/c/3362532
2.  특정 .md 파일을 봅니다.
    예: https://chromium-review.googlesource.com/c/3362532/2/docs/README.md
3.  페이지 왼쪽 위에 다음과 같은 것이 보입니다. <br>
    Base
    [preview](https://chromium.googlesource.com/chromium/src/+/ad44f6081ccc6b92479b12f1eb7e9482f474859d/docs/README.md)
    -> Patchset 3
    [preview](https://chromium.googlesource.com/chromium/src/+/refs/changes/32/3362532/3/docs/README.md)
    | DOWNLOAD <br>
    현재 패치 세트의 미리 보기를 열려면 두 번째
    "[preview](https://chromium.googlesource.com/chromium/src/+/refs/changes/32/3362532/3/docs/README.md)"
    링크를 클릭합니다.

이 **gitiles** 보기가 권위 있는 보기이며, 커밋되었을 때 사용되는 것과 정확히 동일합니다.

## 문서 색인

**참고**: 이것은 모든 문서의 완전한 목록이 아닙니다.

### 체크아웃과 빌드
*   [Linux 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md) - Linux
*   [Mac 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/mac_build_instructions.md) - MacOS
*   [Windows 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md) - Windows
*   [Android 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/android_build_instructions.md) - Android 대상
    (Linux 호스트에서)
*   [Cast 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/cast_build_instructions.md) - Cast 대상
    (Linux 호스트에서)
*   [Android용 Cast 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/android_cast_build_instructions.md) -
    Android용 Cast (Linux 호스트에서)
*   [Fuchsia 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/fuchsia/build_instructions.md) -
    Fuchsia 대상 (Linux 호스트에서)
*   [iOS 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/build_instructions.md) - iOS 대상 (MacOS
    호스트에서)
*   [Gerrit 가이드](https://chromium.googlesource.com/chromium/src/+/main/docs/gerrit_guide.md) - Gerrit 접근 설정
*   [Gerrit ReAuth](https://chromium.googlesource.com/chromium/src/+/main/docs/gerrit_reauth.md) - Gerrit ReAuth 가이드
*   [Chrome OS 빌드 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/chromeos_build_instructions.md) - Chrome OS
*   [Linux Chromium ARM 레시피](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/chromium_arm.md) - Linux에서
    ARM용 Chromium을 빌드하기 위한 레시피.
*   [Chrome Component Build](https://chromium.googlesource.com/chromium/src/+/main/docs/component_build.md) - 더 많은 라이브러리를 사용한
    더 빠른 빌드
*   [Cr 사용자 매뉴얼](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_user_manual.md) - Chromium 작업에 사용되는 일부 도구를
    추상화 계층 뒤로 숨기려는 도구인 `cr`의 매뉴얼

### 설계 문서
*   [design/README.md](https://chromium.googlesource.com/chromium/src/+/main/docs/design/README.md)를 참고하세요

### 통합 개발 환경(IDE) 설정 가이드
*   [Android Studio](https://chromium.googlesource.com/chromium/src/+/main/docs/android_studio.md) - Android 빌드를 위한 Android Studio
*   [Atom](https://chromium.googlesource.com/chromium/src/+/main/docs/atom.md) - Atom 멀티플랫폼 코드 편집기
*   [CLion](https://chromium.googlesource.com/chromium/src/+/main/docs/clion.md) - CLion IDE, GUI 디버깅 지원.
*   [Eclipse for Android](https://chromium.googlesource.com/chromium/src/+/main/docs/eclipse.md) - Android용 Eclipse
*   [Eclipse for Linux](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/eclipse_dev.md) - 다른 플랫폼용 Eclipse
    (이 가이드는 Linux용으로 작성되었지만, Windows/MacOS에서도 아마 사용할 수 있습니다)
*   [EMACS 노트](https://chromium.googlesource.com/chromium/src/+/main/docs/emacs.md) - EMACS 명령/스타일/도구 통합
*   [Qt Creator](https://chromium.googlesource.com/chromium/src/+/main/docs/qtcreator.md) - Qt Creator를 IDE 또는 GUI 디버거로 사용하기
*   [Visual Studio Code](https://chromium.googlesource.com/chromium/src/+/main/docs/vscode.md) - Visual Studio Code

### Git
*   [Git Cookbook](https://chromium.googlesource.com/chromium/src/+/main/docs/git_cookbook.md) - 일반적인 작업을 위한 git 레시피 모음
*   [Git 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/git_tips.md) - 더 많은 git 팁
*   [Git submodules](https://chromium.googlesource.com/chromium/src/+/main/docs/git_submodules.md) - Git 서브모듈(팁, FAQ)

### Clang
*   [Clang 컴파일러](https://chromium.googlesource.com/chromium/src/+/main/docs/clang.md) - Mac과 Linux에서 기본으로 사용되는 clang 컴파일러에 대한 일반 정보
*   [Clang 도구 리팩터링](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_tool_refactoring.md) - AST를 인식하는 리팩터링을 수행하기 위해 clang 도구 활용하기
*   [Clang 정적 분석기](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_static_analyzer.md) - 빌드 시점에 정적 분석을 활성화하는 방법
*   [Clang 코드 커버리지 래퍼](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_code_coverage_wrapper.md) - 소스 파일의 일부에 대해 Clang 코드 커버리지 계측 활성화.
*   [Clang 플러그인 작성](https://chromium.googlesource.com/chromium/src/+/main/docs/writing_clang_plugins.md) - clang 플러그인은 작성하지 마세요. 하지만 작성한다면 이것을 읽으세요
*   [Clang 업데이트](https://chromium.googlesource.com/chromium/src/+/main/docs/updating_clang.md) - 빌드에 사용되는 Clang 버전 업데이트
*   [Chromium C++ 코드에서 clang-format 사용하기](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_format.md) - C++ 코드에 clang-format을 호출하는 다양한 방법
*   [Clang Tidy](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_tidy.md) - Chromium에서 `clang-tidy` 도구 지원
*   [Clang Format 바이너리 업데이트](https://chromium.googlesource.com/chromium/src/+/main/docs/updating_clang_format_binaries.md) - Chromium 체크아웃에 포함되는 clang-format 바이너리를 업데이트하는 방법

### 일반 개발
*   [Chromium에 기여하기](https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md) - Chromium 코드베이스에 기여하기 위한 참조 워크플로 프로세스.
*   [커밋 체크리스트](https://chromium.googlesource.com/chromium/src/+/main/docs/commit_checklist.md) - Gerrit에 CL을 업로드하기 전에 거치는 간소화된 체크리스트.
*   [코드 리뷰](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md) - 코드 리뷰 요구사항 및 지침
*   [의존성 관리](https://chromium.googlesource.com/chromium/src/+/main/docs/dependencies.md) - 의존성 관리(DEPS, git 서브모듈)
*   [존중하는 코드 리뷰](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_respect.md) - 코드 리뷰어를 위한 가이드
*   [존중하는 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_respect.md) - 코드 작성자를 위한 가이드
*   [의무 코드 리뷰 롤아웃](https://chromium.googlesource.com/chromium/src/+/main/docs/code_review_owners.md) - 코드 리뷰 및 OWNERS와 관련된 예정된 정책 변경
*   [LUCI 마이그레이션 FAQ](https://chromium.googlesource.com/chromium/src/+/main/docs/luci_migration_faq.md) - Chromium의 Buildbot에서 LUCI로 빌더를 마이그레이션하는 것에 대한 FAQ
*   [지속적 통합 UI 둘러보기](https://chromium.googlesource.com/chromium/src/+/main/docs/tour_of_luci_ui.md) - 지속적 통합 시스템인 LUCI의 사용자 인터페이스 둘러보기
*   [테스트 결과 파싱](https://chromium.googlesource.com/chromium/src/+/main/docs/parsing_test_results.md) - polygerrit 및 CI 빌드가 내보내는 결과를 이해하는 방법에 대한 소개.
*   [Closure 컴파일](https://chromium.googlesource.com/chromium/src/+/main/docs/closure_compilation.md) - _Closure_ JavaScript 컴파일러
*   [Chrome의 스레딩과 태스크](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks.md) - Chrome에서 태스크를 실행하고 스레드 안전성을 처리하는 방법.
*   [Callback<> 및 Bind()](https://chromium.googlesource.com/chromium/src/+/main/docs/callback.md) - Callback, Closure, Bind()에 관한 모든 것.
*   [Chromium Views UI](https://chromium.googlesource.com/chromium/src/+/main/docs/ui/index.md) - 데스크톱 UI 프레임워크로 작업하기.
*   [Views 플랫폼 스타일링](https://chromium.googlesource.com/chromium/src/+/main/docs/ui/views/platform_style.md) - 서로 다른 네이티브 플랫폼에 맞도록 view가 스타일링되는 방법
*   [Tab Helpers](https://chromium.googlesource.com/chromium/src/+/main/docs/tab_helpers.md) - WebContents/WebContentsObserver를 사용해 브라우저 탭에 기능 추가하기.
*   [third_party 라이브러리 추가](https://chromium.googlesource.com/chromium/src/+/main/docs/adding_to_third_party.md) - 코드를 third_party/에 넣는 방법
*   [Chromium Views용 그래픽 디버깅 보조 도구](https://chromium.googlesource.com/chromium/src/+/main/docs/graphical_debugging_aid_chromium_views.md) - 디버깅 중 view 트리 시각화하기
*   [Bitmap Pipeline](https://chromium.googlesource.com/chromium/src/+/main/docs/bitmap_pipeline.md) - 비트맵이 렌더러에서 화면으로 이동하는 방법.
*   [Flag Guarding 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/flag_guarding_guidelines.md) - 변경 사항을 안전하게 롤아웃하기 위해 서버 제어 kill switch와 A/B 실험을 언제 사용할지.
*   [Origin Trials 프레임워크 사용](https://chromium.googlesource.com/chromium/src/+/main/docs/origin_trials_integration.md) - 테스트를 위해 실험적 API를 조건부로 활성화하는 프레임워크.
*   [Chrome Sync](https://source.chromium.org/chromium/chromium/src/+/main:docs/website/site/developers/design-documents/sync) -
    여러 기기 간에 데이터를 동기화할 수 있게 해 주는 하위 시스템 문서.
*   [Ozone 개요](https://chromium.googlesource.com/chromium/src/+/main/docs/ozone_overview.md) - Ozone은 윈도 시스템과 저수준 입력 및 그래픽 사이의 추상화 계층입니다.
*   [프로젝트 계획에서 브랜치 날짜를 고려하기 위한 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/release_branch_guidance.md) -
    프로젝트 작업 일정을 잡을 때 브랜치 날짜 전후에 해야 할 일과 하지 말아야 할 일.
*   [Watchlists](https://chromium.googlesource.com/chromium/src/+/main/docs/infra/watchlists.md) - 관심 있는 CL 알림을 받기 위해 watchlist 사용하기.
*   [Shutdown](https://chromium.googlesource.com/chromium/src/+/main/docs/shutdown.md) - 새 종료 작업을 어디에 추가할지 더 쉽게 판단할 수 있도록 Chrome 종료의 단계 설명.
*   [API Keys](https://chromium.googlesource.com/chromium/src/+/main/docs/api_keys.md) - 커스텀 빌드, 포크, stock Chromium 통합을 위해 Google API 접근이 필요하거나 ChromiumOS(로그인용)를 빌드하는 경우.
*   [User Education](https://chromium.googlesource.com/chromium/src/+/main/components/user_education/README.md) - Chromium 기능을 강조하기 위한 제품 내 도움말(IPH)과 튜토리얼 만들기.
*   [User-Agent](https://chromium.googlesource.com/chromium/src/+/main/docs/user_agent/README.md) - User-Agent 및 User-Agent Client Hints.

### 테스트
*   [웹 테스트 실행 및 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md)
*   [테스트 비활성화에 관하여](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/on_disabling_tests.md)
*   [웹 테스트 작성](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/writing_web_tests.md) - `content_shell`을 사용하는 웹 테스트
*   [웹 테스트 기대값 및 기준선](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md) - 웹 테스트의 예상 결과 설정.
*   [웹 테스트 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_tips.md) - 웹 테스트 모범 사례
*   [수동 폴백이 있는 웹 테스트](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_with_manual_fallback.md) - 수동 개입을 시뮬레이션하는 테스트 작성
*   [웹 테스트 프레임워크 확장](https://chromium.googlesource.com/chromium/src/+/main/docs/how_to_extend_web_test_framework.md)
*   [웹 테스트 플래키함 수정](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/identifying_tests_that_depend_on_order.md) -
    순서 의존성으로 인한 웹 테스트 플래키함 진단 및 수정.
*   [`content_shell`을 사용한 웹 테스트 실행](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md) -
    웹 테스트를 직접 실행하기.
*   [Web Platform Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md) - 브라우저 벤더 간 공유 테스트
*   [`content_shell`에서 Crashpad 사용](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/using_crashpad_with_content_shell.md) -
    디버거가 연결되지 않은 레이아웃 테스트 크래시에서 스택 트레이스 캡처
*   [테스트 설명](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/test_descriptions.md) - 빌드 가능한 단위 테스트 대상과 관련 설명.
*   [Fuzz Testing](https://chromium.googlesource.com/chromium/src/+/main/testing/libfuzzer/README.md) - Chromium의 퍼즈 테스트.
*   [AddressSanitizer(asan) 및 LeakSanitizer(lsan)로 Chrome 테스트 실행](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/linux_running_asan_tests.md) -
    주소 지정 문제와 메모리 누수를 감지하기 위해 ASAN 및 LSAN 빌드로 Chrome 테스트 실행.
*   [코드 커버리지](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/code_coverage.md) - Chromium의 코드 커버리지.
*   [Gerrit의 코드 커버리지](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/code_coverage_in_gerrit.md) - 코드 리뷰를 돕기 위한 Gerrit의 CL별 코드 커버리지.
*   [Chrome for Testing](https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_for_testing/README.md) - 표준 Chrome과 비교한 Chrome for Testing의 기능적 및 동작상 차이.
*   [Chrome for Testing 구성](https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_for_testing/chrome_for_testing_configuration.md) - Chrome for Testing 필수 구성요소 설치 및 UI 동작 사용자 지정.

### 구성 문서

*   [구성: Prefs, Settings, Features, Switches & Flags](https://chromium.googlesource.com/chromium/src/+/main/docs/configuration.md) - 새 기능을 게이트하는 다양한 방법 설명.
*   [chrome://flags에 새 feature flag 추가](https://chromium.googlesource.com/chromium/src/+/main/docs/how_to_add_your_feature_flag.md) - 기능을 실험하기 위해 새 feature flag를 추가하는 빠른 가이드.
*   [Runtime Enabled Features](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md)
*   [content 계층에서 Blink 런타임 기능 초기화](https://chromium.googlesource.com/chromium/src/+/main/docs/initialize_blink_features.md)
*   [origin trials 프레임워크와 기능 통합](https://chromium.googlesource.com/chromium/src/+/main/docs/origin_trials_integration.md)
*   [Origin-Trial로 제어되는 HTML 요소를 위한 커스텀 타입 헬퍼](https://chromium.googlesource.com/chromium/src/+/main/docs/custom_type_helpers_for_origin_trial_elements.md)

### GPU 관련 문서
*   [GPU Pixel Wrangling](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/pixel_wrangling.md) - GPU
    pixel wrangling(GPU sheriffing 로테이션)을 위한 지침.
*   [GPU 관련 코드 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/debugging_gpu_related_code.md) - GPU 및 그래픽 관련 코드 디버깅 힌트.
*   [GPU Testing](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/gpu_testing.md) - Chromium의 GPU 테스트 인프라 설명.
*   [GPU Bot Details](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/gpu_testing_bot_details.md) - 봇이 유지관리되는 방법에 대한 심층 설명.

### 기타 Linux 전용 문서
*   [Linux Proxy Config](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/proxy_config.md) - Linux의 네트워크 프록시 소스
*   [Linux에서 SSL 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/debugging_ssl.md) - Linux에서 SSL 코드 디버깅 팁
*   [Linux Cert Management](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/cert_management.md) - Linux에서 X.509 인증서 관리
*   [Linux에서 디버깅 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/debugging.md)
*   [Linux GTK Theme Integration](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/gtk_theme_integration.md) - Chrome이 GTK+ 테마와 어울리도록 하기.
*   [Linux의 브라우저 플러그인](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/plugins.md) - Linux에서 브라우저 플러그인이 작동하는 방식에 대한 정보 링크 모음
*   [Linux Crash Dumping](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/crash_dumping.md) - Breakpad가 Google 크래시 서버에 크래시 보고서를 업로드하는 방법.
*   [Linux Minidump to Core](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/minidump_to_core.md) - Breakpad가 생성한 미니덤프 파일을 대부분의 디버거가 읽을 수 있는 코어 파일로 변환하는 방법
*   [Linux Sandbox IPC](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/sandbox_ipc.md) - 콜 스택의 아래쪽에서 브라우저까지 요청을 라우팅하는 데 사용되는 저수준 UPC 시스템.
*   [Linux Dev Build as Default Browser](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/dev_build_as_default_browser.md) -
    Linux에서 Chrome Dev 빌드를 기본 브라우저로 구성하는 방법.
*   [Linux Chromium Packages](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/chromium_packages.md) - 일부 Linux 배포판에서 제공하는 Chromium 브라우저(Chrome 아님) 패키지.
*   [`seccomp` Sandbox Crash Dumping](https://chromium.googlesource.com/chromium/src/+/main/docs/seccomp_sandbox_crash_dumping.md) - seccomp 샌드박스에서 실행 중인 프로세스의 크래시 덤프에 관한 노트.
*   [Linux Password Storage](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/password_storage.md) - Chromium과 Linux 사이의 키체인 통합.
*   [Linux Sublime Development](https://chromium.googlesource.com/chromium/src/+/main/docs/sublime_ide.md) - Linux에서 Chromium 개발을 위해 Sublime을 IDE로 사용하기.
*   [GTK 빌드 및 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/building_debug_gtk.md) - 낮은 최적화 수준 및/또는 더 많은 디버깅 심벌을 사용해 GTK에 대해 Chromium 빌드하기.
*   [GTK 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/debugging_gtk.md) - GTK Debug 패키지 및 관련 도구 사용.
*   [Chroot 노트](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/using_a_chroot.md) - 일부 Linux 버전의 libfreetype 차이를 우회하기 위해 chroot 설정하기.
*   [Linux Sandboxing](https://chromium.googlesource.com/chromium/src/+/main/sandbox/linux/README.md) - 서로 다른 권한을 가진 브라우저 구성요소를 격리하기 위한 Linux 멀티프로세스 모델.
*   [Zygote Process](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/zygote.md) - 새 프로세스를 생성하는 데 사용되는 Linux Zygote 프로세스의 작동 방식.
*   [Linux에서 웹 테스트 실행](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_linux.md) - 웹 테스트 실행을 위한 Linux 전용 지침.
*   [Linux Sysroot Images](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/sysroot.md) - 빌드가 Linux에서 라이브러리를 사용하는 방법
*   [Linux Hardware Video Decoding](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/hw_video_decode.md) - Linux에서 하드웨어 비디오 디코드 코드 경로 활성화

### 기타 MacOS 전용 문서
*   [Mac 디버깅 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/mac/debugging.md) - Mac에서의 디버깅 소개 및 유용한 팁 모음.
*   [Mac에서 CCache 사용](https://chromium.googlesource.com/chromium/src/+/main/docs/ccache_mac.md) - ccache와 clang/ninja를 사용해 Mac에서 빌드 속도 높이기
*   [Cocoa tips and tricks](https://chromium.googlesource.com/chromium/src/+/main/docs/cocoa_tips_and_tricks.md) - Cocoa view와 controller를 작성할 때 사용되는 관용구 모음

### 기타 Windows 전용 문서
*   [cygwin rebaseall 실패 처리](https://chromium.googlesource.com/chromium/src/+/main/docs/cygwin_dll_remapping_failure.md)
*   [Chromium에서 ANGLE 해킹하기](https://chromium.googlesource.com/chromium/src/+/main/docs/angle_in_chromium.md) - DirectX 위에 구축된 OpenGL ES 2.0
*   [Windows Split DLLs](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_split_dll.md) - Windows의 툴체인 한계를 우회하기 위해 `chrome.dll`을 여러 dll로 분할하기.
*   [Windows Native Window Occlusion Tracking](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_native_window_occlusion_tracking.md)
*   [Windows PWA Integration](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_pwa_integration.md) - Windows에서 Progressive Web Apps와의 통합
*   [Windows Shortcut and Taskbar Handling](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_shortcut_and_taskbar_handling.md)
*   [Windows Virtual Desktop Integration](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_virtual_desktop_handling.md)

### 기타 Android 전용 문서
*   [Android용 Chrome의 Google Play Services](https://chromium.googlesource.com/chromium/src/+/main/docs/google_play_services.md)
*   [Java에서 C++ Enum 접근](https://chromium.googlesource.com/chromium/src/+/main/docs/android_accessing_cpp_enums_in_java.md) - Java 코드에서 C++로 정의된 enum을 사용하는 방법
*   [Android에서 Content Shell 프로파일링](https://chromium.googlesource.com/chromium/src/+/main/docs/profiling_content_shell_on_android.md) - Android에서 `content_shell` 프로파일링 설정
*   [Android로 원격 작업](https://chromium.googlesource.com/chromium/src/+/main/docs/working_remotely_with_android.md) - 로컬 머신에 연결된 Android 기기를 대상으로 원격 머신에서 빌드하기
*   [Android 테스트 지침](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/android_test_instructions.md) - Android 기기 또는 에뮬레이터에서 빌드 실행.
*   [Android 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/android_debugging_instructions.md) - Android에서 실행되는 Java 및/또는 C/C++ 코드를 디버깅하는 도구와 팁.
*   [Android Logging](https://chromium.googlesource.com/chromium/src/+/main/docs/android_logging.md) - Chrome의 logging API가 Android의 `android.util.Log`와 함께 작동하는 방식 및 사용 지침.
*   [Android Java 정적 분석](https://chromium.googlesource.com/chromium/src/+/main/build/android/docs/lint.md) - 'lint' 도구로 컴파일 시점에 Java 관련 문제 포착하기.
*   [Java Code Coverage](https://chromium.googlesource.com/chromium/src/+/main/build/android/docs/coverage.md) - EMMA 도구로 코드 커버리지 데이터 수집.
*   [Dynamic Feature Modules (DFMs)](https://chromium.googlesource.com/chromium/src/+/main/docs/android_dynamic_feature_modules.md) - 이것들이 무엇이며 새 모듈을 만드는 방법.
*   [기타 빌드 관련 Android 문서](https://chromium.googlesource.com/chromium/src/+/main/build/android/docs/README.md)
*   [Android용 Chrome UI](https://chromium.googlesource.com/chromium/src/+/main/docs/ui/android/overview.md) - UI 개발을 위한 리소스 및 모범 사례

### 기타 iOS 전용 문서
*   [iOS용 Chromium의 지속적 빌드 및 테스트 인프라](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/infra.md)
*   [iOS용 Chrome에서 링크 열기](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/opening_links.md) - iOS 앱이 Chrome에서 링크를 열도록 하는 방법.
*   [iOS용 Chrome의 User Agent](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/user_agent.md) - iOS용 Chrome에서 사용하는 User Agent 문자열에 관한 노트.
*   [로컬에서 iOS 테스트 스위트 실행](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/testing.md)
*   [iOS에서 프로젝트 파일 작업](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/working_with_files.md) - iOS Chromium 프로젝트에서 파일을 추가, 제거, 이름 변경하는 방법.

### 기타 Chrome-OS 전용 문서
*   [캡티브 포털 및 기타 제한적 네트워크 설정](https://chromium.googlesource.com/chromium/src/+/main/docs/login/restrictive_networks.md)
*   [Enterprise Enrollment](https://chromium.googlesource.com/chromium/src/+/main/docs/enterprise/enrollment.md)
    *   [Kiosk mode and public sessions](https://chromium.googlesource.com/chromium/src/+/main/docs/enterprise/kiosk_public_session.md)
*   [OOBE/login/lock에서 UI 디버깅](https://chromium.googlesource.com/chromium/src/+/main/docs/login/ui_debugging.md)
*   [Chrome OS의 Chrome Logging](https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_os_logging.md)
*   [디버깅 팁](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/chromeos_debugging_tips.md)

### 기타 WebUI 전용 문서
*   [WebUI Explainer](https://chromium.googlesource.com/chromium/src/+/main/docs/webui/webui_explainer.md) - 웹 기술(즉, chrome:// URL)로 구현된 Chrome UI를 위한 C++ 및 TypeScript 인프라 코드 설명.
*   [Chrome Web UI 최적화](https://chromium.googlesource.com/chromium/src/+/main/docs/webui/optimizing_web_uis.md) - WebUI 성능을 높이기 위한 노트
*   [WebUI의 Trusted Types](https://chromium.googlesource.com/chromium/src/+/main/docs/webui/trusted_types_on_webui.md) - Trusted Types를 염두에 두고 WebUI에서 코딩하기 위한 팁.
*   [chrome-untrusted:// FAQ](https://chromium.googlesource.com/chromium/src/+/main/docs/webui/chrome_untrusted.md) - 신뢰할 수 없는 콘텐츠를 처리하는 WebUI를 호스팅하기 위한 `chrome-untrusted://` 스킴 사용 설명.

### 미디어
*   [Audio Focus Handling](https://chromium.googlesource.com/chromium/src/+/main/docs/media/audio_focus.md) - 여러 MediaSession 오디오 스트림이 상호작용하는 방식
*   [HTMLMediaElements 자동재생](https://chromium.googlesource.com/chromium/src/+/main/docs/media/autoplay.md) - HTMLMediaElements가 자동재생되는 방식.
*   [Latency tracing](https://chromium.googlesource.com/chromium/src/+/main/docs/media/latency_tracing.md) - 오디오 지연 시간을 측정하기 위해 `"audio.latency"` tracing 카테고리를 사용하는 방법.
*   [Piranha Plant](https://chromium.googlesource.com/chromium/src/+/main/docs/piranha_plant.md) - MediaStreams의 미래 아키텍처
*   [Media Capture](https://chromium.googlesource.com/chromium/src/+/main/docs/media/capture/README.md) - 브라우저가 자기 자신 또는 기반 OS에서 픽셀과 오디오를 캡처할 수 있게 하는 기능 및 API.
*   [Video Encode Accelerator Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/media/gpu/video_encoder_test_usage.md) - 가속 비디오 인코더 테스트 프로그램을 사용하는 방법.
*   [Video Decoder Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/media/gpu/video_decoder_test_usage.md) - 비디오 디코더 테스트 실행.
*   [Video Decoder Performance Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/media/gpu/video_decoder_perf_test_usage.md) -
    비디오 디코더 성능 테스트 실행.

### 접근성
*   [접근성 개요](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/overview.md) - Chromium의 접근성 관련 관심사와 접근 방식 개요.
*   [접근성 테스트](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/browser/tests.md) - 코드베이스에서 접근성 관련 테스트를 찾을 수 있는 위치.
*   [Chrome OS의 ChromeVox](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/os/chromevox.md) - Chrome OS에서 음성 피드백(ChromeVox) 활성화.
*   [데스크톱 Linux의 ChromeVox](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/os/chromevox_on_desktop_linux.md) - 데스크톱 Linux에서 음성 피드백(ChromeVox) 활성화.
*   [Offscreen, Invisible and Size](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/browser/offscreen.md) - Chrome이 접근성 트리에서 offscreen, invisible, size를 정의하는 방법.
*   [Text to Speech](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/browser/tts.md) - Chrome 및 Chrome OS의 text to speech 개요.
*   [Chrome OS의 BRLTTY](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/os/brltty.md) - refreshable braille display를 지원하기 위한 Chrome OS와 BRLTTY 통합
*   [Chrome OS의 PATTS](https://chromium.googlesource.com/chromium/src/+/main/docs/accessibility/os/patts.md) - Chrome OS에서 사용되는 PATTS 음성 합성 엔진에 관한 노트
*   [VoiceOver](https://chromium.googlesource.com/chromium/src/+/main/docs/ios/voiceover.md) - iOS의 Chromium에서 Apple의 VoiceOver 기능 사용하기.

### 메모리
*   [Memory Overview](https://chromium.googlesource.com/chromium/src/+/main/docs/memory/README.md)
*   [외부 도구로 힙 프로파일링](https://chromium.googlesource.com/chromium/src/+/main/docs/memory/heap_profiling_external.md)

### Memory Infrastructure Timeline Profiling (MemoryInfra)
*   [Overview](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/README.md)
*   [GPU Profiling](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/probe-gpu.md)
*   [구성요소에 트레이싱 추가](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/adding_memory_infra_tracing.md)
*   [Startup Tracing 활성화](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/memory_infra_startup_tracing.md)
*   [CC의 메모리 사용량](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/probe-cc.md)
*   [Memory Benchmarks](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/memory_benchmarks.md)
*   [Heap Profiling](https://chromium.googlesource.com/chromium/src/+/main/docs/memory-infra/heap_profiler.md)

### Metrics
*   [Histograms](https://chromium.googlesource.com/chromium/src/+/main/tools/metrics/histograms/README.md)
*   [User Actions](https://chromium.googlesource.com/chromium/src/+/main/tools/metrics/actions/README.md)
*   [Code review guidelines](https://chromium.googlesource.com/chromium/src/+/main/tools/metrics/histograms/review_guidelines.md)

### 기타
*   [Useful URLs](https://chromium.googlesource.com/chromium/src/+/main/docs/useful_urls.md) - 다양한 도구와 대시보드로 가는 링크 모음
*   [ERC IRC](https://chromium.googlesource.com/chromium/src/+/main/docs/erc_irc.md) - EMACS에서 IRC에 접근하기 위해 ERC 사용하기
*   [Kiosk Mode](https://chromium.googlesource.com/chromium/src/+/main/docs/kiosk_mode.md) - kiosk mode 시뮬레이션.
*   [User Handle Mapping](https://chromium.googlesource.com/chromium/src/+/main/docs/user_handle_mapping.md) - Chromium/IRC/Google 전반에서 사용되는 개발자 이름
*   [Documentation Best Practices](https://chromium.googlesource.com/chromium/src/+/main/docs/documentation_best_practices.md)
*   [Documentation Guidelines](https://chromium.googlesource.com/chromium/src/+/main/docs/documentation_guidelines.md)
*   [Chromium Browser vs Google Chrome](https://chromium.googlesource.com/chromium/src/+/main/docs/chromium_browser_vs_google_chrome.md) - _Chromium Browser_와 _Google Chrome_의 차이는 무엇인가?
*   [Google Chrome branded builds](https://chromium.googlesource.com/chromium/src/+/main/docs/google_chrome_branded_builds.md)
*   [WPAD를 사용한 Proxy Auto Config](https://chromium.googlesource.com/chromium/src/+/main/docs/proxy_auto_config.md) - WPAD 서버가 프록시 설정을 자동으로 지정하는 데 사용되는 방법.
*   [VMWare에 Chromium OS 설치](https://chromium.googlesource.com/chromium/src/+/main/docs/installation_at_vmware.md) - VMWare에 Chromium OS를 설치하는 방법.
*   [User Data Directory](https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_dir.md) - 모든 플랫폼에서 사용자 데이터 및 캐시 디렉터리가 결정되는 방법.
*   [User Data Storage](https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_storage.md) - User Data 안의 파일에 대한 정책 문서.

### Mojo &amp; Services
*   [Mojo &amp; Services 소개](https://chromium.googlesource.com/chromium/src/+/main/docs/mojo_and_services.md) - 예제와 함께 보는 Chromium의 Mojo와 서비스에 대한 빠른 소개
*   [Mojo API Reference](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md) - Mojo 전반에 대한 자세한 참조 문서
*   [Service Development Guidelines](https://chromium.googlesource.com/chromium/src/+/main/services/README.md) - Chromium 트리에서 서비스 개발을 위한 지침
*   [Chromium 기능 서비스화](https://chromium.googlesource.com/chromium/src/+/main/docs/servicification.md) - 신규 및 기존 하위 시스템을 Chromium에 서비스로 통합하기 위한 일반 조언
*   [Legacy IPC를 Mojo로 변환](https://chromium.googlesource.com/chromium/src/+/main/docs/mojo_ipc_conversion.md) - 실무 IPC 변환 작업을 위한 팁과 일반 패턴
*   [Mojo “Style” Guide](https://chromium.googlesource.com/chromium/src/+/main/docs/security/mojo.md) - Mojo 및 IPC 리뷰어가 권장하는 모범 사례
*   [D-Bus Mojo Connection Service](https://chromium.googlesource.com/chromium/src/+/main/docs/dbus_mojo_connection_service.md) - CrOS 서비스의 Mojo 연결을 부트스트랩하기 위한 Chrome의 서비스.

### 보안
*   [The Rule Of 2](https://chromium.googlesource.com/chromium/src/+/main/docs/security/rule-of-2.md) - 신뢰할 수 없는 콘텐츠(웹에서 다운로드한 모든 것 등)를 처리할 때 중요한 보안 규칙.

### 속도
*   [Chrome Speed](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/README.md) - Chrome의 성능 측정 및 회귀에 관한 문서.
*   [Chrome Speed Metrics](https://chromium.googlesource.com/chromium/src/+/main/docs/speed_metrics/README.md) - 웹의 사용자 경험 메트릭과 그 JavaScript API에 관한 문서.

### 안정성
*   [stability/crash 메트릭 및 보고 개요](https://chromium.googlesource.com/chromium/src/+/main/docs/stability.md) - Chrome이 안정성을 모니터링하고 안정성 향상을 시도하는 다양한 방식을 설명합니다.

### UI
*   [Chromium UI Platform](https://chromium.googlesource.com/chromium/src/+/main/docs/ui/index.md) - 사용자 인터페이스에 관한 모든 것

### What's Up With That 녹취록

이것들은 Chromium 소프트웨어 엔지니어와의 인터뷰 비디오 시리즈인
[What's Up With That](https://www.youtube.com/playlist?list=PL9ioqAuyl6ULIdZQys3fwRxi3G3ns39Hq)의 녹취록입니다.

*   [What's Up With Pointers - Episode 1](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e01-pointers.md)
*   [What's Up With DCHECKs - Episode 2](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e02-dchecks.md)
*   [What's Up With //content - Episode 3](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e03-content.md)
*   [What's Up With Tests - Episode 4](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e04-tests.md)
*   [What's Up With BUILD.gn - Episode 5](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e05-build-gn.md)
*   [What's Up With Open Source - Episode 6](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e06-open-source.md)
*   [What's Up With Mojo - Episode 7](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e07-mojo.md)
*   [What's Up With Processes - Episode 8](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e08-processes.md)
*   [What's Up With Site Isolation - Episode 9](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e09-site-isolation.md)
*   [What's Up With Web Platform - Episode 10](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e10-web-platform.md)
*   [What's Up With Web Standards - Episode 11](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e11-web-standards.md)
*   [What's Up With Base - Episode 12](https://chromium.googlesource.com/chromium/src/+/main/docs/transcripts/wuwt-e12-base.md)

### 아마도 폐기된 문서
*   [TPM Quick Reference](https://chromium.googlesource.com/chromium/src/+/main/docs/tpm_quick_ref.md) - Trusted Platform Module 노트.
*   [System Hardening Features](https://chromium.googlesource.com/chromium/src/+/main/docs/system_hardening_features.md) - 현재 및 계획된 Chrome OS 보안 기능 목록.
*   [WebView Policies](https://chromium.googlesource.com/chromium/src/+/main/docs/webview_policies.md)
*   [Linux Profiling](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/profiling.md) - Linux에서 Chromium을 프로파일링하는 방법
*   [Linux Graphics Pipeline](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/graphics_pipeline.md)
*   [Linux `SUID` Sandbox](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/suid_sandbox.md) - Linux에서 SUID 바이너리를 사용해 렌더러 샌드박싱하기
*   [Linux `SUID` Sandbox Development](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/suid_sandbox_development.md) -
    위 시스템의 개발.
*   [Linux PID Namespace Support](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/pid_namespace_support.md)
*   [Vanilla msysgit workflow](https://chromium.googlesource.com/chromium/src/+/main/docs/vanilla_msysgit_workflow.md) - Windows에서 대부분 vanilla git을 사용하는 워크플로.
*   [Old Options](https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_settings.md) - Material Design 이전 chrome://settings 노트.
