import importlib.util
import unittest
from copy import deepcopy
from pathlib import Path


SCRIPT = Path(__file__).with_name('report.py')


class EntryPointTests(unittest.TestCase):
    def test_reusable_report_generator_is_available(self):
        self.assertTrue(SCRIPT.is_file(), 'Reusable report generator is not implemented yet')


class ReportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not SCRIPT.is_file():
            raise unittest.SkipTest('The report generator is not implemented yet')
        spec = importlib.util.spec_from_file_location('contribution_report', SCRIPT)
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)

    def records(self):
        return [
            {'id': '1', 'url': 'https://crrev.com/c/1', 'author': 'alice',
             'date': '2027-06-01', 'status': 'merged', 'verifiedProject': 'chromium/src',
             'mergeEventAt': '2027-07-12'},
            {'id': '2', 'url': 'https://crrev.com/c/2', 'author': 'bob',
             'date': '2027-08-16', 'status': 'in review', 'verifiedProject': 'v8/v8'},
        ]

    def build(self, records=None, activities=None):
        return self.module.aggregate(
            records or self.records(), {'activities': activities or []},
            year=2027, start='2027-07-11', challenges_end='2027-08-14',
            masters_end='2027-10-24', as_of='2027-10-06',
        )

    def test_created_and_merge_dates_are_independent(self):
        result = self.build()
        counts = result['counts']['Unique total']
        self.assertEqual(counts['Pull Request']['Before'], 1)
        self.assertEqual(counts['Pull Request']['Masters'], 1)
        self.assertEqual(counts['Merge']['Before'], 0)
        self.assertEqual(counts['Merge']['Challenges'], 1)

    def test_folding_preserves_total_and_masters(self):
        original = self.build()
        result = self.module.fold_preprogram(original, 'challenges')
        self.assertEqual(result['counts']['Unique total']['Pull Request'],
                         {'Total': 2, 'Challenges': 1, 'Masters': 1, 'After': 0})
        self.assertEqual(original['counts']['Unique total']['Pull Request']['Before'], 1)

    def test_repeated_issue_activity_is_unique_in_total_but_present_in_both_periods(self):
        activities = [
            {'id': '10', 'project': 'Chromium', 'kind': 'reported',
             'author': 'alice', 'date': '2027-08-01', 'automaticOnFix': None},
            {'id': '10', 'project': 'Chromium', 'kind': 'fixed',
             'author': 'alice', 'date': '2027-09-01', 'automaticOnFix': None},
        ]
        counts = self.build(activities=activities)['counts']['Unique total']
        self.assertEqual(counts['Issue']['Total'], 1)
        self.assertEqual(counts['Issue']['Challenges'], 1)
        self.assertEqual(counts['Issue']['Masters'], 1)
        self.assertEqual(counts['Issue Reporting']['Total'], 1)
        self.assertEqual(counts['Issue Fixed']['Total'], 1)

    def test_duplicate_urls_and_exports_do_not_inflate_total(self):
        records = self.records()
        records += [deepcopy(records[0]),
                    {'id': 'export', 'duplicateOf': '1'}]
        self.assertEqual(self.build(records)['counts']['Unique total']['Pull Request']['Total'], 2)

    def test_folding_repeated_preprogram_issue_activity_uses_unique_ids(self):
        activities = [
            {'id': '10', 'project': 'Chromium', 'kind': 'reported',
             'author': 'alice', 'date': '2027-06-01', 'automaticOnFix': None},
            {'id': '10', 'project': 'Chromium', 'kind': 'assigned',
             'author': 'alice', 'date': '2027-08-01', 'automaticOnFix': False},
        ]
        result = self.module.fold_preprogram(self.build(activities=activities), 'challenges')
        self.assertEqual(result['counts']['Unique total']['Issue']['Challenges'], 1)
        self.assertEqual(result['counts']['Unique total']['Issue Reporting']['Challenges'], 1)

    def test_unknown_merge_date_is_rejected(self):
        records = self.records()
        records[0].pop('mergeEventAt')
        records[0]['updated'] = '2027-07-12'
        with self.assertRaisesRegex(ValueError, 'merge date'):
            self.build(records)

    def test_conflicting_duplicates_are_rejected(self):
        records = self.records()
        conflicting = deepcopy(records[0])
        conflicting['status'] = 'abandoned'
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            self.build(records + [conflicting])

    def test_site_status_is_preserved_when_source_status_differs(self):
        records = self.records()
        records[1]['sourceReviewStatus'] = 'merged'
        records[1]['mergeEventAt'] = '2027-09-01'
        result = self.build(records)
        self.assertEqual(result['statusTotals']['in review'], 1)
        self.assertEqual(result['counts']['Unique total']['Merge']['Total'], 1)

    def test_independent_wpt_commit_count_uses_verified_pr_metadata(self):
        records = self.records() + [
            {'id': 'wpt-3', 'url': 'https://github.com/web-platform-tests/wpt/pull/3',
             'author': 'alice', 'date': '2027-07-15', 'status': 'in review',
             'verifiedProject': 'web-platform-tests/wpt', 'commitCount': 3},
        ]
        counts = self.build(records)['counts']['WPT']
        self.assertEqual(counts['Pull Request']['Total'], 1)
        self.assertEqual(counts['Commit']['Total'], 3)

    def test_five_separate_tables_without_extra_sections(self):
        result = self.module.fold_preprogram(self.build(), 'challenges')
        html, text = self.module.render_tables(result)
        self.assertEqual(html.count('<table>'), 5)
        self.assertEqual(text.count('### '), 5)
        self.assertNotIn('프로그램 이전', text)
        self.assertNotIn('프로그램 이후', text)


if __name__ == '__main__':
    unittest.main()
