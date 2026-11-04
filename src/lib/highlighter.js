// Wird als eigener Chunk nachgeladen (siehe highlight.js) – nur wenn eine Seite Code enthält.
// Weitere Sprachen: Import ergänzen und in die Liste aufnehmen (Übersicht: node_modules/@tanstack/highlight/dist/languages).
import { createHighlighter } from '@tanstack/highlight/core';
import { css } from '@tanstack/highlight/languages/css';
import { diff } from '@tanstack/highlight/languages/diff';
import { dockerfile } from '@tanstack/highlight/languages/dockerfile';
import { env } from '@tanstack/highlight/languages/env';
import { go } from '@tanstack/highlight/languages/go';
import { graphql } from '@tanstack/highlight/languages/graphql';
import { html } from '@tanstack/highlight/languages/html';
import { http } from '@tanstack/highlight/languages/http';
import { java } from '@tanstack/highlight/languages/java';
import { js } from '@tanstack/highlight/languages/js';
import { json } from '@tanstack/highlight/languages/json';
import { jsx } from '@tanstack/highlight/languages/jsx';
import { kotlin } from '@tanstack/highlight/languages/kotlin';
import { markdown } from '@tanstack/highlight/languages/markdown';
import { php } from '@tanstack/highlight/languages/php';
import { python } from '@tanstack/highlight/languages/python';
import { scss } from '@tanstack/highlight/languages/scss';
import { shell } from '@tanstack/highlight/languages/shell';
import { sql } from '@tanstack/highlight/languages/sql';
import { toml } from '@tanstack/highlight/languages/toml';
import { ts } from '@tanstack/highlight/languages/ts';
import { tsx } from '@tanstack/highlight/languages/tsx';
import { vue } from '@tanstack/highlight/languages/vue';
import { yaml } from '@tanstack/highlight/languages/yaml';

export const highlighter = createHighlighter({
  languages: [
    css, diff, dockerfile, env, go, graphql, html, http, java, js, json, jsx, kotlin,
    markdown, php, python, scss, shell, sql, toml, ts, tsx, vue, yaml,
  ],
});
