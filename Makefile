.PHONY: test scout-sample scout-sync scout-report

test:
	python3 -m unittest discover -s tests -p 'test_*.py' -v

scout-sample:
	python3 scripts/scout_library.py --db data/sample.sqlite3 sync --catalog tests/fixtures/gutenberg_sample.csv
	python3 scripts/scout_library.py --db data/sample.sqlite3 report --output data/reports/sample.md

scout-sync:
	python3 scripts/scout_library.py sync

scout-report:
	python3 scripts/scout_library.py report
