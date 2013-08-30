

check: test lint

lint: 
	@echo -n 'Checking code style... '
	@$(CURDIR)/node_modules/.bin/jshint $(CURDIR)/lib/*
	@$(CURDIR)/node_modules/.bin/jshint $(CURDIR)/test/*
	@echo "\033[0;32m[OK]\033[0m"

publish: test lint
	@npm publish

test:
	@NODE_ENV=test "$(CURDIR)/node_modules/.bin/mocha" \
		--reporter dot \
		--check-leaks \
		--ui bdd


.PHONY: lint publish test
