---
title: Visual Studio Code 개발
order: 33
group: 번역 · docs
description: VS Code로 Chromium 개발하기
source_path: docs/vscode.md
source_sha256: 99acfa44d8744339be8a6d1b7b7f18ab76856a4cd7cdcbf20158f0f4ee7373d6
translation_status: full
---
> 이 문서는 **Visual Studio Code Dev**([`docs/vscode.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/vscode.md)) 문서의 한국어 전체 번역입니다.

**[여기](#setup)에서 시작하세요**.

[Visual Studio Code (VS Code)](https://code.visualstudio.com)는 Windows, macOS, Linux용 무료 오픈 소스 경량 고성능 코드 편집기로, [Electron](https://www.electronjs.org/)/Chromium 기반입니다. JavaScript, TypeScript, Node.js에 대한 내장 지원이 있으며, intellisense, 디버깅, 구문 강조 등을 추가하는 풍부한 확장 생태계를 갖추고 있습니다. C++, Python, Go, Java 같은 많은 언어에서는 많은 설정 없이도 동작합니다.

Visual Studio 같은 완전한 IDE는 아닙니다. 두 제품은 완전히 별개의 제품입니다. Visual Studio와의 유일한 공통점은 둘 다 Microsoft 제품이라는 점입니다.

잘 동작하는 것들은 다음과 같습니다.

*   **코드 편집**은 특히 [키보드 단축키](#Keyboard-Shortcuts)에 익숙해지면 잘 동작합니다. VS Code는 반응성이 매우 좋고 Chromium 같은 큰 코드베이스도 처리할 수 있습니다.
*   **Git 통합**은 매우 훌륭합니다. 내장된 나란히 보기, 로컬 커밋, 그리고 [히스토리](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)와 [blame 보기](https://marketplace.visualstudio.com/items?itemName=ryu1kn.annotator)를 위한 확장까지 제공합니다.
*   [**디버깅**](https://code.visualstudio.com/Docs/editor/debugging)은 시작 시간이 꽤 길 수 있지만(Linux에서 gdb 사용 시 약 40초, Windows에서는 훨씬 짧음) 잘 동작합니다. 코드를 단계별로 실행하고, 변수를 검사하고, 여러 스레드의 호출 스택을 볼 수 있습니다.
    *   Python 코드 디버깅에 대한 자세한 내용은 [여기](https://chromium.googlesource.com/chromium/src/+/main/docs/vscode_python.md)를 참조하세요.
*   **Command Palette**는 파일 열기와 솔루션 검색을 매우 쉽게 해 줍니다.
*   **빌드**도 잘 동작합니다. 빌드 도구를 쉽게 통합할 수 있습니다. 경고와 오류는 별도 페이지에 표시되며, 클릭해서 해당 코드 줄로 이동할 수 있습니다.
*   **VS Code Remote**는 원격으로 호스팅되는 코드를 편집할 수 있게 해 주며, vscode-clangd 같은 계산 비용이 큰 플러그인도 원격 서버에서 실행할 수 있게 해 줍니다. 재택근무에 좋습니다. 자세한 내용은 [Remote 섹션](#Remote)을 참조하세요.


## 이 페이지 업데이트하기

이 문서를 최신 상태로 유지해 주세요. VS Code는 아직 활발히 개발 중이며 변경될 수 있습니다. 이 문서는 Chromium git 저장소에 체크인되어 있으므로, 변경할 경우 [문서화 가이드라인](https://chromium.googlesource.com/chromium/src/+/main/docs/documentation_guidelines.md)을 읽고 [change list를 제출](https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md)하세요.

모든 파일 경로와 명령은 Linux와 macOS에서 테스트되었습니다. Windows에서는 약간 다른 설정이 필요할 수 있습니다. 그에 맞게 이 페이지를 업데이트해 주세요.

## 설정

### 설치

*** promo
Googler: 대신 [go/vscode/install](http://go/vscode/install)을 참조하세요.
***

개발 플랫폼에 맞는 적절한 버전을 설치하려면 [Visual Studio Code 설정하기][setup]의 단계를 따르세요.

[setup]: https://code.visualstudio.com/docs/setup/setup-overview

### 사용법

Linux 또는 macOS에서 실행하려면:

```bash
cd /path/to/chromium/src
code .
```

Code Insiders를 설치했다면 바이너리 이름은 대신 `code-insiders`입니다.

VS Code에는 프로젝트 또는 솔루션 파일이 필요하지 않습니다. 하지만 기본 디렉터리(즉, 프로젝트 루트 폴더)의 `.vscode` 폴더에 워크스페이스 설정을 저장합니다. 자세한 내용은 [Chromium 워크스페이스 설정](#setup-for-chromium) 섹션을 참조하세요.

### 유용한 확장

지금까지는 언어 지원이 많지 않은 기본 VS Code 버전을 갖고 있습니다. 다음으로 유용한 확장 몇 가지를 설치하겠습니다.

#### 권장 확장

다음 확장들은 대부분 매일 사용하게 될 것입니다.

설치 방법은 2가지입니다.

*   [권장 확장 설치](#install-recommended-extensions)의 지침을 따릅니다.
*   수동 설치. 확장 창(`Ctrl+Shift+X`, macOS에서는 `Cmd+Shift+X`)으로 이동해 다음 확장 이름을 검색합니다.

*** aside
참고: 아래에 언급된 모든 확장 설정은 이미 `tools/vscode/settings.json`에 설정되어 있습니다. 해당 파일을 워크스페이스로 복사하는 [지침](#setup-for-chromium)을 따랐다면 아무것도 할 필요가 없습니다.
***

*   [**ChromiumIDE**](https://marketplace.visualstudio.com/items?itemName=Google.cros-ide) - 핵심 도구를 한곳에 고정해 Chromium/ChromiumOS 개발을 더 쉽고 빠르게 만드는 중요한 확장입니다.
*   [**Chromium Context**](https://marketplace.visualstudio.com/items?itemName=solomonkinard.chromium-context) - 열린 파일에 대해 코드 소유자, 릴리스 버전, 작성자 blame 목록 같은 Chromium 전용 컨텍스트를 단일 탭에 제공합니다.
*   [**C/C++**](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) - 코드 포매팅, 디버깅, Intellisense. clang-format 사용(`C_Cpp.clang_format_path` 설정을 통해)과 저장 시 포맷(`editor.formatOnSave` 설정을 통해)을 가능하게 합니다.
*   [**vscode-clangd**](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) - VS Code가 Chromium을 컴파일하고, 정의로 이동 같은 기능을 지원하는 Chromium XRef를 제공하며, **C/C++** 확장의 IntelliSense보다 더 똑똑한 자동 완성을 구동하는 clangd [language server][lang-server]를 제공할 수 있게 합니다. 하지만 둘은 서로 충돌하기도 합니다. 충돌을 해결하려면 `settings.json`에 다음을 추가하세요: `"C_Cpp.intelliSenseEngine": "disabled"`. 설정 지침은 [clangd.md](https://chromium.googlesource.com/chromium/src/+/main/docs/clangd.md)를 참조하세요.
*   [**Toggle Header/Source**](https://marketplace.visualstudio.com/items?itemName=bbenoist.togglehs) - `F4`로 .cc와 .h 사이를 전환합니다. C/C++ 확장도 `Alt+O`를 통해 이를 지원하지만, 워크스페이스에 같은 이름의 파일이 여러 개 있을 때 가끔 잘못된 파일을 선택합니다.
*   [**Protobuf VSC**](https://marketplace.visualstudio.com/items?itemName=DrBlury.protobuf-vsc) - .proto 파일 구문 강조.
*   [**Mojom IDL support**](https://marketplace.visualstudio.com/items?itemName=Google.vscode-mojom) - .mojom 파일을 위한 구문 강조와 [language server][lang-server].
*   [**GN**](https://marketplace.visualstudio.com/items?itemName=google.gn) - GN 빌드 시스템을 위한 [language server][lang-server].
*   [**Rewrap**](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap) - `Alt+Q`로 줄을 80자로 줄바꿈합니다.
*   [**Remote**](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) - 노트북에서 SSH를 통해 워크스테이션에 원격으로 연결합니다. 설정 방법에 대한 자세한 정보는 [Remote](#Remote) 섹션을 참조하세요.
*   [**GitLens**](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Git을 강력하게 강화합니다. 강력하고 기능이 풍부하며 고도로 사용자 정의 가능한 git 확장입니다.
*   [**Python**](https://marketplace.visualstudio.com/items?itemName=ms-python.python) - 린팅, intellisense, 코드 포매팅, 리팩터링, 디버깅, 스니펫.
    *   타입 검사를 원한다면 `settings.json` 파일에 `"python.analysis.typeCheckingMode": "basic",`을 추가하세요(설정 UI에서도 찾을 수 있습니다).

[lang-server]: https://microsoft.github.io/language-server-protocol/

#### 선택 확장

다음 확장들은 [//tools/vscode/settings.json](https://chromium.googlesource.com/chromium/src/+/main/tools/vscode/settings.json)에 포함되어 있지 않지만, 여러분에게도 유용할 수 있습니다.

```bash
$ echo "ryu1kn.annotator wmaurer.change-case" \
  "shd101wyy.markdown-preview-enhanced" \
  "Gruntfuggly.todo-tree" \
  "alefragnani.Bookmarks" \
  "spmeesseman.vscode-taskexplorer" \
  "streetsidesoftware.code-spell-checker" \
  "george-alisson.html-preview-vscode anseki.vscode-color" \
  | xargs -n 1 code --force --install-extension
```

*   [**Annotator**](https://marketplace.visualstudio.com/items?itemName=ryu1kn.annotator) - 코드와 함께 git blame 정보를 표시합니다. 거기에서 특정 커밋의 diff도 열 수 있습니다.
*   [**change-case**](https://marketplace.visualstudio.com/items?itemName=wmaurer.change-case) - 현재 선택 영역 또는 현재 단어의 대소문자를 빠르게 변경합니다.
*   [**Markdown Preview Enhanced**](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) - `Ctrl+k v`로 자동 스크롤 동기화와 여러 다른 기능을 갖춘 markdown 나란히 미리보기를 제공합니다. 이 문서는 이 확장으로 작성되었습니다!
*   [**Todo Tree**](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) - TODO/FIXME 같은 주석 태그를 전용 사이드바의 트리 뷰에 표시합니다.
*   [**Bookmarks**](https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks) - 코드베이스에서 위치를 쉽게 표시/해제할 수 있고 이를 전용 사이드바에 표시합니다. Chromium 같은 큰 코드베이스에 매우 유용합니다.
*   [**Task Explorer**](https://marketplace.visualstudio.com/items?itemName=spmeesseman.vscode-taskexplorer) - vscode 태스크, 셸 스크립트 등 지원되는 태스크를 사이드바의 트리뷰로 구성해 표시합니다.
*   [**Code Spell Checker**](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) - camelCase 코드와 잘 동작하는 기본 맞춤법 검사기입니다. 흔한 철자 오류를 잡는 데 도움이 됩니다.
*   [**HTML Preview**](https://marketplace.visualstudio.com/items?itemName=george-alisson.html-preview-vscode) - `Ctrl+k v`로 편집 중인 HTML 파일을 미리 봅니다.
*   [**Color Picker**](https://marketplace.visualstudio.com/items?itemName=anseki.vscode-color) - 색상 코드를 인라인으로 시각화하고 새 색상 코드를 생성하는 색상 선택기 GUI를 제공합니다.
*   [**Bazel**](https://marketplace.visualstudio.com/items?itemName=BazelBuild.vscode-bazel) - `*.star` starlark 파일을 편집할 때 매우 유용합니다. `infra/config` 디렉터리에서 "Go to definition"이 동작하길 원한다면 [//tools/vscode/bazel_lsp/README.md][lsp_patches_readme]를 참조하세요.
*   [**Gerrit**](https://marketplace.visualstudio.com/items?itemName=SanderRonde.vscode--gerrit) - 코드 리뷰를 위해 [Chromium의 Gerrit 인스턴스](https://chromium-review.googlesource.com/)와 상호작용합니다. 참고: Chromium의 Gerrit은 Stream Events 권한을 제공할 수 없습니다.

[lsp_patches_readme]: ../tools/vscode/bazel_lsp/README.md

다른 유용한 확장을 확인하려면 [VS Code marketplace](https://marketplace.visualstudio.com/VSCode)도 꼭 살펴보세요.

### 색 구성표

`Ctrl+Shift+P`(macOS에서는 `Cmd+Shift+P`)를 누르고 `color`를 입력한 다음 `Enter`를 눌러 편집기 색 구성표를 선택하세요. 또한 [marketplace](https://marketplace.visualstudio.com/search?target=VSCode&category=Themes&sortBy=Downloads)에서 다운로드할 수 있는 색 구성표도 아주 많습니다.

### 키보드 단축키

#### 치트시트

*   [Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)
*   [macOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf)

#### 유용한 단축키(Linux)

*   `Ctrl+P`는 파일을 찾고 열기 위한 검색 상자를 엽니다.
*   `F1` 또는 `Ctrl+Shift+P`는 명령(예: Tasks: Run Task)을 찾기 위한 검색 상자를 엽니다. 참고: [tasks.json의 사전 정의 태스크](#Tasks) 중 하나를 실행하려면 `Ctrl+P` > "task <n>"을 사용하는 것이 더 빠릅니다.
*   `Ctrl+K, Ctrl+S`는 키 바인딩 편집기를 엽니다.
*   ``Ctrl+` ``는 내장 터미널을 토글합니다.
*   `Ctrl+Shift+M`은 문제 보기(린터 경고, 컴파일 오류와 경고)를 토글합니다. 컴파일 중에는 터미널과 문제 보기 사이를 자주 전환하게 됩니다.
*   `Alt+O`는 소스/헤더 파일 사이를 전환합니다.
*   `Ctrl+G`는 특정 줄로 이동합니다.
*   `F12`는 커서 위치의 심볼 정의로 이동합니다(오른쪽 클릭 컨텍스트 메뉴에서도 사용 가능).
*   `Shift+F12` 또는 `F1, CodeSearchReferences, Return`은 커서 위치의 심볼에 대한 모든 참조를 표시합니다.
*   `F1, CodeSearchOpen, Return`은 현재 파일을 Code Search에서 엽니다.
*   `Ctrl+D`는 커서 위치의 단어를 선택합니다. 여러 번 누르면 다음 발생 위치를 다중 선택하므로, 한 곳에 입력하면 모든 선택 위치에 입력되고, `Ctrl+U`는 마지막 발생 위치 선택을 해제합니다.
*   `Ctrl+K, Z`는 현재 편집기만 보이는 전체 화면 편집 모드인 Zen Mode로 들어갑니다.
*   아무것도 선택하지 않은 상태에서 `Ctrl+X`는 현재 줄을 잘라냅니다. `Ctrl+V`는 그 줄을 붙여넣습니다.

*** aside
참고: [Visual Studio Code의 Key Bindings](https://code.visualstudio.com/docs/getstarted/keybindings)도 참조하세요.
***

### Java/Android 지원

VSCode에서 Java/Android 지원을 얻기 위해 사용할 수 있는 확장은 두 가지입니다.

*   a.
    [ChromiumIDE](https://marketplace.visualstudio.com/items?itemName=Google.cros-ide)
*   b.
    [Language Support for Java™ by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)

ChromiumIDE는 다른 확장보다 훨씬 빠르고 안정적입니다. 주된 이유는 백그라운드 인덱싱과 영구 캐시에 의존하지 않기 때문입니다. 이 확장은 GN에서 빌드 구성을 추출하는 방법을 알고 있으므로 명령줄에서 스크립트를 수동으로 실행하지 않아도 동작합니다. 반면, 다른 확장에 비해 기능은 제한적입니다(예: 디버거는 아직 지원되지 않음).

Language Support for Java™ by Red Hat은 Eclipse JDT Language Server 기반이므로 더 많은 기능을 갖고 있습니다. 하지만 매우 느린 것으로 알려져 있으며(VSCode의 요청을 처리하기 전에 단일 스레드에서 전체 프로젝트를 인덱싱하는 데 수십 분이 걸림), 안정성도 낮습니다(소스 checkout을 sync하면 종종 혼란스러워져 캐시를 지우고 다시 인덱싱을 기다려야 함).

#### a. ChromiumIDE

VSCode marketplace에서 [ChromiumIDE](https://marketplace.visualstudio.com/items?itemName=Google.cros-ide)의 최신 **pre-release** 버전을 설치하세요. 확장 버전이 **0.35.32** 이상인지 확인하세요.

그런 다음 Chromium 소스 트리를 포함하는 VSCode 워크스페이스를 열고(하위 디렉터리를 열어도 괜찮음) Java 파일을 여세요. 아직 설정하지 않았다면 기본 빌드 출력 디렉터리(예: `out/Default`)를 선택하라는 메시지가 표시됩니다.

#### b. Language Support for Java™ by Red Hat

1.  **VS Code 워크스페이스 `settings.json`에 다음을 추가하세요:**

    ```
    "java.import.gradle.enabled": false,
    "java.import.maven.enabled": false
    ```

    이렇게 하면 language server가 Chromium 소스 트리 어디에서든 찾을 수 있는 *모든* Gradle 및 Maven 프로젝트를 빌드하려고 시도하는 것을 막을 수 있으며, 이는 보통 큰 혼란을 초래합니다.

    ```
    "java.jdt.ls.java.home": "<< ABSOLUTE PATH TO YOUR WORKING COPY OF CHROMIUM >>/src/third_party/jdk/current"
    ```

    이것은 선택 사항이지만, language server가 호스트 시스템의 임의 JDK가 아니라 Chromium 빌드 시스템과 같은 JDK를 사용하도록 보장해 문제 가능성을 줄입니다.

    또한 Java Language Server가 사용할 수 있는 리소스를 늘리세요. 예:

    ```
    "java.jdt.ls.vmargs": "-XX:+UseParallelGC -XX:GCTimeRatio=4 -XX:AdaptiveSizePolicyWeight=90 -Dsun.zip.disableMemoryMapping=true -Xmx64G -Xms100m -Xlog:disable"
    ```

2.  **[*Language Support for Java™ by Red Hat*](https://marketplace.visualstudio.com/items?itemName=redhat.java) 확장을 설치하세요.** 다른 확장은 필요하지 않습니다.

3.  일반적인 방식(즉, gn과 ninja 명령 사용)으로 **코드를 빌드하세요**. 그러면 다음 단계에 필요한 빌드 구성 파일이 생성됩니다. 또한 자동 생성 코드가 language server에 보이게 됩니다.

4.  `src` 디렉터리에서 `build/android/generate_vscode_project.py`를 실행해 **Eclipse JDT 프로젝트를 생성하세요**. 예를 들어 빌드 출력 디렉터리가 `out/Debug-x86`이고 빌드 대상이 `//chrome/android:chrome_java`라면 다음을 실행합니다: `build/android/generate_vscode_project.py --output-dir out/Debug-x86
    --build-config gen/chrome/android/chrome_java.build_config.json`. 이렇게 하면 `src` 디렉터리에 `.project`와 `.classpath`가 생성됩니다.

5.  생성된 프로젝트 가져오기를 시작하도록 VS Code 창을 **다시 로드**하세요.

6.  **Java 소스 파일을 연 다음 language server가 프로젝트를 빌드할 때까지 몇 분 기다리세요**.

7.  **완료!** 이제 빌드에 포함된 모든 `.java` 파일에 대해 완전한 Java 언어 지원을 사용할 수 있어야 합니다.

##### 알려진 문제

*   `GEN_JNI`와 관련된 오류는 [자동 생성된](https://chromium.googlesource.com/chromium/src/+/main/third_party/jni_zero/README.md) `GEN_JNI` 클래스의 여러 정의에 대해 language server가 (정당하게) 혼란스러워하기 때문에 발생합니다. 이는 JNI generator의 알려진 특이 사항입니다.

##### 문제 해결

*   이전 지침에 따라 `generate_vscode_classpath.py`를 사용했거나 뭔가 잘못되었다고 생각한다면, command palette에서 `Java: Clean Java Language Server Workspace`를 실행해 language server의 내부 상태를 지워 보세요. 이렇게 하면 language server가 생성된 Eclipse JDT 프로젝트를 가져와 내부 워크스페이스를 다시 빌드하게 됩니다.

#### 자동 포매팅

Chromium의 Java 코드는 [clang-format](https://chromium.googlesource.com/chromium/src/+/main/docs/clang_format.md)을 사용해 포맷됩니다. VS Code가 clang-format을 사용해 Java 파일을 포맷하도록 하려면 [*Clang-Format* 확장](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)을 설치하고 워크스페이스 `settings.json`에서 Java의 기본 포매터로 설정하세요.

```json
"[java]": {
  "editor.defaultFormatter": "xaver.clang-format"
}
```

clang-format 버전 차이로 인한 잠재적인 포매팅 차이를 피하려면, 확장이 `git cl format`과 같은 방식으로 clang-format을 실행하도록 구성하는 것이 좋습니다. 워크스페이스 `settings.json`에 다음을 추가하면 됩니다.

```json
"clang-format.executable": "<< PATH TO YOUR CHROMIUM WORKING COPY >>/src/buildtools/linux64/clang-format"
```

## Chromium용 설정

VS Code는 JSON 파일을 통해 구성됩니다. 이 섹션에서는 더 나은 Chromium 개발 경험을 위해 VS Code를 구성하는 방법을 설명합니다.

*** aside
참고: VS Code 사용자 정의에 대한 더 일반적인 소개는 [VS Code 문서](https://code.visualstudio.com/docs/customization/overview)를 참조하세요.
***

Chromium 저장소에는 기본 구성이 일부 포함되어 있습니다. Chromium checkout에 대해 VS Code를 초기화하려면 다음 명령을 실행하세요.

```bash
cd /path/to/chromium/src
mkdir .vscode
cp tools/vscode/*.json .vscode/
cp tools/vscode/cpp.code-snippets .vscode/
```

완료했다면 다음 섹션으로 진행해 권장 확장을 설치하고 사용자 정의를 수행하세요.

### 권장 확장 설치

[유용한 확장](#useful-extensions) 섹션에서 설명했듯이 Chromium 개발에 도움이 되는 필수 확장들이 있습니다. 아래 단계를 따르세요.

1.  VS Code의 Command Palette(`Ctrl+Shift+P`, macOS에서는 `Cmd+Shift+P`)에서 `Show Recommended Extensions`를 입력하고 `Enter`를 누릅니다.
2.  EXTENSIONS 사이드바의 WORKSPACE RECOMMENDATIONS 섹션에서 `Install Workspace Recommended Extensions`(구름 아이콘으로 표시됨)를 클릭합니다.

이제 모두 준비되었습니다.

### 워크스페이스 설정 사용자 정의

[//tools/vscode/settings.json](https://chromium.googlesource.com/chromium/src/+/main/tools/vscode/settings.json) 파일을 열어 기본 설정을 확인하세요. 더 나은 팀 개발을 가능하게 하기 위해 추가 또는 제거한 설정을 자유롭게 커밋하거나, 개인 취향에 맞게 `.vscode/settings.json`에서 로컬 설정을 변경하세요.

*** aside
참고: 이 설정들은 워크스페이스 폴더(Explorer 탭에 표시되는 루트 폴더)가 Chromium의 `src/` 디렉터리라고 가정합니다. 그렇지 않은 경우 `${workspaceFolder}`에 대한 모든 참조를 `src/` 경로로 바꾸세요.
***

### 태스크

다음으로 VS Code에 코드를 컴파일하고, 테스트를 실행하고, 빌드 출력에서 경고와 오류를 읽는 방법을 알려 줍니다.

`.vscode/tasks.json` 파일을 여세요. 이 파일은 기본적인 작업을 수행하는 태스크를 제공합니다. 상황과 필요에 맞게 명령을 조정해야 할 수 있습니다. 예를 들어 대부분의 태스크를 실행하기 전에 해당 파일의 `chromeOutputDir` 값을 설정해야 합니다.

이제 `Ctrl+P`(macOS에서는 `Cmd+Shift+P`)를 사용하고 "task "와 원하는 숫자를 입력해 태스크를 실행할 수 있습니다. 빌드 태스크 중 하나를 선택하면 빌드 출력이 터미널 패널에 표시됩니다. `F8` / `Shift-F8`을 사용해 빌드 문제 사이를 빠르게 이동하세요. 태스크 실행에 대한 자세한 내용은 [태스크 이름](#task-names)을 참조하세요.

intellisense를 활성화했지만 include 경로를 올바르게 설정하지 않았다면, 문제 사이를 이동할 때 찾을 수 없는 모든 include 파일로도 이동하려고 하여 많은 잡음이 생깁니다. include 경로를 고치거나 다음과 같이 intellisense를 "tag parser" 모드로 설정할 수 있습니다.

1.  Preferences(`Ctrl+Shift+P` > "Preferences: Open User Settings")를 엽니다.
2.  설정 검색 상자에 "intellisense engine"을 입력합니다.
3.  제공자로 "Tag Parser"를 선택합니다.

참고: Chromebook에서는 **🔍+<맨 윗줄에서 ESC가 아닌 8번째 버튼>**을 사용하세요. 대부분의 경우 이는 8 키 바로 위에 가장 가까운 맨 윗줄 버튼입니다.

### 실행 명령

실행 명령은 Visual Studio의 `F5`와 동일합니다. 어떤 프로그램이나 디버거를 실행합니다. 선택적으로 `tasks.json`에 정의된 태스크를 실행할 수도 있습니다. 실행 명령은 debug view(`Ctrl+Shift+D`)에서 실행할 수 있습니다.

`.vscode/launch.json` 파일을 열고 예시 실행 명령을 상황과 필요에 맞게 조정하세요(예: "type" 값은 Windows용으로 조정해야 함).

### 키 바인딩

키 바인딩을 편집하려면 `Ctrl+K, Ctrl+S`를 누르세요. 왼쪽에는 기본값이, 오른쪽에는 `.vscode/keybindings.json` 파일에 저장된 오버라이드가 표시됩니다. 살펴보고 상황과 필요에 맞게 조정하세요. 키 바인딩을 변경하려면 해당 키 바인딩을 오른쪽으로 복사하세요. 꽤 자명합니다.

`CodeSearchOpen` 같은 확장에서 지정한 명령을 포함해 어떤 명령이든 키에 바인딩할 수 있습니다. 예를 들어 `CodeSearchOpen`을 `F2`에 바인딩하려면 `{ "key": "F2", "command": "cs.open" },`를 추가하면 됩니다. 명령 제목 `CodeSearchOpen`은 동작하지 않습니다. 확장의 [package.json 파일](https://github.com/chaopeng/vscode-chromium-codesearch/blob/master/package.json)에서 실제 명령 이름을 가져와야 합니다.

다른 편집기에 익숙하다면 선호하는 keymap도 설치할 수 있습니다. 예를 들어 eclipse keymap을 설치하려면 `vscode-eclipse-keybindings` 확장을 설치하세요. 더 많은 keymap은 [marketplace](https://marketplace.visualstudio.com/search?target=vscode&category=Keymaps)에서 찾을 수 있습니다.

### 알려진 문제에 대한 수정

#### Windows의 Git

컴퓨터에 `depot_tools` Git만 설치되어 있고 PATH에 들어 있더라도, VS Code는 `git.exe`를 찾는 것처럼 보여 이를 무시합니다. Git 통합이 동작하도록 하려면 설정에 다음을 추가해야 합니다.

```json
{
  "git.path": "C:\\src\\depot_tools\\git.bat"

  // more settings here...
}
```

팁: `Ctrl+Shift+P`를 사용하고 "Preferences: Open User Settings (JSON)" 동사를 사용해 설정 JSON 파일로 이동할 수 있습니다(어떤 이유에서인지 `git.path`를 폴더 설정으로 지정하는 것은 동작하지 않는 것 같습니다).

### Remote

*** promo
Googler: 대신 [go/vscode-remote](http://go/vscode-remote)를 참조하세요.
***

VS Code에는 이제 코드가 다른 곳에 호스팅되어 있는 동안 노트북에서 VS Code를 사용할 수 있게 하는 [Remote](https://code.visualstudio.com/docs/remote/remote-overview) 프레임워크가 있습니다. 이는 clangd도 원격으로 실행할 수 있게 해 주는 vscode-clangd 플러그인과 함께 사용할 때 특히 빛을 발합니다.

이를 실행하려면 Remote pack 확장을 설치한 다음 ssh config 파일에 원격 연결이 있는지 확인하세요.

`~/.ssh/config`:

```
Host my-connection
  HostName my-remote-host.corp.company.com
```

그러면 VS Code가 왼쪽의 'Remote Explorer' 섹션에 이 연결을 나열합니다. 이 연결로 VS Code를 실행하려면 나열된 호스트 이름 옆의 '+window' 아이콘을 클릭하세요. 폴더를 선택하라고 나오면 'src' 폴더 루트를 사용하세요. 그러면 'Remote' 모드의 새 VS Code 창이 열립니다. ***이제 vscode-clangd 등과 같은 확장을 원격 연결에 대해 별도로 설치할 수 있습니다.***

#### Chromebook

Googler의 경우, Crostini를 사용하지 않고 Chromebook에서 원격 개발을 설정하는 Google 전용 지침은 [여기](http://go/vscode/remote_development_via_web)에 있습니다.

#### Windows 및 SSH

VS Code 원격 도구에는 기본적으로 Windows에 설치되어 있지 않은 'sshd'가 필요합니다.

Googler의 경우 워크스테이션에 sshd가 이미 설치되어 있어야 하며, [go/building-chrome-win](http://go/building-chrome-win)의 설정 지침을 따랐다면 VS Code가 원격으로 동작해야 합니다. 여전히 문제가 있다면 [go/vscode-remote#windows](http://go/vscode-remote#windows)를 참조하세요.

비-Googler는 [OpenSSH 서버 설치](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse)에 대한 Microsoft 지침을 따르면 됩니다. 이 단계를 따르면 VS Code가 원격으로 동작해야 합니다.

### 스니펫

[//tools/vscode/cpp.code-snippets](https://chromium.googlesource.com/chromium/src/+/main/tools/vscode/cpp.code-snippets)에 유용한 스니펫이 제공되어 있으며, 이는 이미 `.vscode/cpp.code-snippets`로 워크스페이스에 설치되어 있습니다.

### 팁

#### `out` 폴더

자동 생성 코드는 `out/`의 하위 폴더에 들어갑니다. 이는 이 파일들이 VS Code에서 무시되며(위 files.exclude 참조), 예를 들어 quick-open(`Ctrl+P`)에서 열 수 없다는 뜻입니다. 버전 1.21 기준으로 VS Code는 부정 glob 명령을 지원하지 않지만, `out/Debug/gen`만 포함하도록 제외 패턴 집합을 정의할 수 있습니다.

```
"files.exclude": {
  // Ignore build output folders. Except out/Debug/gen/
  "out/[^D]*/": true,
  "out/Debug/[^g]*": true,
  "out/Debug/g[^e]*": true,
  "out_*/**": true,
},
```

지원되면, symlink 대신 files.exclude에서 다음을 사용할 수 있습니다.

```
"!out/Debug/gen/**": true
```

#### VS Code를 git 편집기로 사용하기

git 커밋 메시지 등에 VS Code를 편집기로 사용하려면 `~/.gitconfig` 파일에 `[core] editor = "code --wait"`를 추가하세요. 편집기 시작이 nano나 vim보다 상당히 느리다는 점에 유의하세요. VS Code를 merge tool로 사용하려면 `[merge] tool = code`를 추가하세요.

#### 태스크 이름

태스크 이름을 `1-build_chrome_debug`, `2-build_chrome_release` 등으로 지정했다는 점에 유의하세요. 이렇게 하면 번호를 눌러 태스크를 빠르게 실행할 수 있습니다. `Ctrl+P`를 누르고 `task <n>`을 입력하세요. 여기서 `<n>`은 태스크 번호입니다. 태스크 실행을 위한 키보드 단축키를 만들 수도 있습니다. `File > Preferences > Keyboard Shortcuts`로 이동해 `{ "key": "ctrl+r", "command": "workbench.action.tasks.runTask", "when": "!inDebugMode" }`를 추가하세요. 그러면 `Ctrl+R`을 누르고 `<n>`을 입력하면 충분합니다.

#### 노트북에서 작업하기

배터리를 절약하려면 git status 자동 새로고침을 비활성화하는 것이 좋습니다.

```
"git.autorefresh": false,
```

#### 여러 Git 저장소에서 편집하기

Chromium 저장소의 일부인 여러 Git 저장소에서 자주 작업한다면, Chromium에 체크인된 `.gitignore` 파일에 포함된 폴더 아래에 있는 파일에 대해 내장 도구가 예상대로 동작하지 않는 것을 볼 수 있습니다.

이를 우회하려면 편집하는 디렉터리를 워크스페이스 구성의 별도 `folders` 항목으로 추가하고, Chromium에서 무시되는 디렉터리가 Chromium `src` 경로보다 **앞에** 나열되도록 하세요.

이를 편집하려면 `Settings` -> `Workspace` 탭 선택으로 이동하고, JSON으로 열기(오른쪽 위 버튼)를 선택한 다음, 다음과 같이 `folders`를 구성하세요(로컬 설정과 사용 방식에 맞게 경로를 변경하세요).

```
{
  "folders": [
    {
      "path": "chromium/src/third_party/perfetto"
    },
    {
      "path": "chromium/src"
    }
  ]
}
```

### Linux에서 Chromium을 디버깅할 때 $File resource is not available을 열 수 없음

Chromium은 [최근](https://docs.google.com/document/d/1OX4jY_bOCeNK7PNjVRuBQE9s6BQKS8XRNWGK8FEyh-E/edit?usp=sharing) 파일 경로를 출력 디렉터리 기준 상대 경로로 변경했습니다. `strip_absolute_paths_from_debug_symbols`가 true인지(기본값) `gn args out/$dir --list`로 확인하고, true라면 `cwd`를 출력 디렉터리로 설정하세요. 그렇지 않으면 `cwd`를 `${workspaceFolder}`로 설정하세요.

### 더 보기

더 많은 팁과 요령은 [여기](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)에서 찾을 수 있습니다.

---

원문 링크: https://raw.githubusercontent.com/chromium/chromium/main/docs/vscode.md

## History

- 2026-07-11: Chromium docs `docs/vscode.md` 원문 전체를 한국어로 번역해 노트로 저장.
