build-BackendFunction:
	./node_modules/.bin/esbuild src/lambda.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--format=cjs \
		--minify \
		--sourcemap \
		--outfile="$(ARTIFACTS_DIR)/src/lambda.js"

build-MigrationFunction:
	./node_modules/.bin/esbuild src/migrate.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--format=cjs \
		--minify \
		--sourcemap \
		--outfile="$(ARTIFACTS_DIR)/src/migrate.js"
	cp -R drizzle "$(ARTIFACTS_DIR)/drizzle"
