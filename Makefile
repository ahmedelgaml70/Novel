.PHONY: test scout-sample scout-sync scout-report scout-materialize scout-load-sample-evidence scout-resolve scout-form-report

test:
	python3 -m unittest discover -s tests -p 'test_*.py' -v

scout-sample:
	rm -f data/sample.sqlite3
	python3 scripts/scout_library.py --db data/sample.sqlite3 sync --catalog tests/fixtures/gutenberg_sample.csv
	python3 scripts/form_resolver.py --db data/sample.sqlite3 materialize
	python3 scripts/form_resolver.py --db data/sample.sqlite3 load-evidence --file tests/fixtures/form_evidence_sample.jsonl
	python3 scripts/form_resolver.py --db data/sample.sqlite3 resolve
	python3 scripts/scout_library.py --db data/sample.sqlite3 report --output data/reports/sample.md
	python3 scripts/form_resolver.py --db data/sample.sqlite3 report --output data/reports/sample_forms.md

scout-sync:
	python3 scripts/scout_library.py sync

scout-materialize:
	python3 scripts/form_resolver.py materialize

scout-resolve:
	python3 scripts/form_resolver.py resolve

scout-report:
	python3 scripts/scout_library.py report

scout-form-report:
	python3 scripts/form_resolver.py report
