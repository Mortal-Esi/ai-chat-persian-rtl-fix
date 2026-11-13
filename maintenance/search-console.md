# Search Console setup

Public landing page:
https://mortal-esi.github.io/ai-chat-persian-rtl-fix/

1. Sign in to https://search.google.com/search-console with the owner's Google account.
2. Add a URL-prefix property for the exact landing page URL above (including the project path).
3. Choose HTML tag verification. Add the exact Google-provided verification meta tag
   to the head of docs/index.html, publish it, then click Verify in Search Console.
   Do not invent a token. Keep the tag after successful verification.
4. Submit sitemap.xml for this property:
   https://mortal-esi.github.io/ai-chat-persian-rtl-fix/sitemap.xml
5. Inspect the homepage URL and request indexing. Indexing and ranking are not guaranteed.

Official verification instructions:
https://support.google.com/webmasters/answer/9008080

The site has no analytics or Google verification token until the owner supplies one.
Do not use a Domain property for github.io, whose DNS is not controlled by this project.

Publishing source: main branch, /docs. Landing demo assets include copies of content.js
and style.css; sync them from the extension sources when those files change.
