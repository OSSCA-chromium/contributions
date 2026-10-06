---
name: ossca-contribution-report
description: Use when preparing OSSCA Chromium contribution statistics, project tables, mentee charts, or Notion clipboard content from the Contributions archive and verified crbug evidence. Also use when reconciling report counts with the site. Archive maintenance and source-code changes use their own workflows.
---

# OSSCA Contribution Report

이 저장소의 데이터 구조와 집계 기준을 사용하는 프로젝트 스킬입니다. Contributions 사이트와 대조할 수 있는 정량 보고서를 작성합니다. 집계 근거와 출력 형식을 분리하여, 표의 기간을 바꿔도 원본 날짜·상태·crbug 증거를 보존합니다.

## 입력과 집계 기준

- 사이트 기준 요청은 사이트에 등록된 해당 연도 기록과 등록 상태를 사용합니다. 연도 전체와 프로그램 기간을 구분하고, 조회일·원본 Git SHA를 남깁니다.
- 프로젝트는 실제 Gerrit project와 GitHub repository를 확인합니다. `module: devtools`와 DevTools 저장소는 서로 다른 기준입니다.
- Gerrit CL 1건을 Pull Request 1건과 제출 Commit 1건으로 계산합니다. Patchset은 추가 Commit이 아닙니다. 직접 제출한 WPT PR의 Commit은 GitHub에서 확인합니다.
- WPT export PR은 원본 CL과 중복입니다. 등록된 직접 PR과 구분하고, 연계 성과는 전체 합계에 다시 더하지 않습니다.
- crbug는 검증된 Reporting·Assigned·Fixed 이벤트를 사용합니다. Issue는 고유 ID 수이며 활동별 개수의 합이 아닙니다. 서로 다른 기간에도 같은 이슈가 등장할 수 있습니다.

새 증거 수집이나 데이터 필드 확인이 필요하면 [evidence.md](references/evidence.md)를 읽습니다. 이미 확인한 집계를 재포맷하는 요청에는 기존 `verified-counts.json`을 사용합니다.

## 표 생성

각 스크립트의 `--help`는 파일이나 클립보드를 변경하지 않습니다. 명령은 Contributions 저장소 루트에서 실행합니다. 생성 결과와 수집 증거는 `.cache/contribution-sync/` 아래에 저장합니다.

기존 수치를 유지하며 프로그램 이전을 Challenges에 합치는 경우:

```bash
python3 .agents/skills/ossca-contribution-report/scripts/report.py --counts <verified-counts.json> \
  --preprogram challenges --output <output-directory>
```

기본 출력은 **전체 합계, Chromium, V8, WPT, DevTools 표 5개**입니다. HTML·Markdown·CSV와 검증된 집계 JSON을 생성합니다. 기간은 `--preprogram separate`로 별도 표시할 수 있습니다. 프로그램 이후 기록이 있으면 별도 열로 표시합니다. 숫자·날짜·인원은 고정하지 않습니다.

새 기록에서 계산하는 경우:

```bash
python3 .agents/skills/ossca-contribution-report/scripts/report.py --records <verified-site-records.json> \
  --crbug <verified-activities.json> --snapshot <snapshot.json> \
  --year 2026 --as-of 2026-10-06 \
  --challenges-start 2026-07-11 --challenges-end 2026-08-14 \
  --masters-end 2026-10-24 --preprogram challenges --output <output-directory>
```

위 날짜는 사용 예시입니다. 실행 시 사용자가 선택한 연도와 기간을 적용합니다. 제출은 Created, Merge는 정확한 Submitted/Merged, crbug는 활동 이벤트의 UTC 날짜로 구분합니다. `updated`로 머지일을 대신하지 않습니다.

## 차트와 클립보드

차트를 요청받으면 `python3 .agents/skills/ossca-contribution-report/scripts/charts.py --counts <generated-verified-counts.json> --output <chart-directory>`를 실행합니다. 필요하면 `--year`, `--as-of`, `--font`를 지정합니다. `matplotlib`이 필요합니다. 가로 누적 막대그래프는 기록이 있는 멘티 전원과 평균선을 표시하며, 상태 순서는 Merged → In Review → Abandoned입니다. 월별 데이터가 있으면 상태 분포·월별 차트도 생성합니다. PNG를 열어 글자·범례·겹침을 확인합니다.

클립보드 저장을 요청받은 macOS에서는 다음을 실행합니다:

```bash
swift .agents/skills/ossca-contribution-report/scripts/copy-notion.swift \
  <output-directory>/notion-project-tables.html \
  <output-directory>/notion-project-tables.md
```

이 스크립트는 HTML과 plain text를 함께 저장하고 실제 읽기 결과를 비교합니다. Notion 게시나 저장소 변경을 수행하지 않습니다.

완료 전에 프로젝트 합계·중복·기간·Issue 고유 수·표 5개를 확인합니다. 변경한 집계 로직은 `python3 .agents/skills/ossca-contribution-report/scripts/test_report.py`로 검증합니다. 결과와 사용한 출처, 확인하지 못한 범위를 보고합니다.
