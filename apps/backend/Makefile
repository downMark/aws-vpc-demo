build-BackendFunction:
	./node_modules/.bin/esbuild src/lambda.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--format=cjs \
		--minify \
		--sourcemap \
		--outfile="$(ARTIFACTS_DIR)/src/lambda.js"
