<div align="center" dir="ltr">
  <p><img src="icons/logo.svg" width="96" height="96" alt="Persian RTL Fix logo"></p>
  <h1>AI Chat Persian RTL Fix</h1>
  <p dir="rtl">افزونهٔ Chrome برای بهبود نمایش متن فارسی و عربی در کنار عبارت‌های انگلیسی در رابط‌های وب چت هوش مصنوعی</p>
  <p>Improve mixed Persian/Arabic and English text layout in AI chat web interfaces.</p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
    <a href="#installation"><img src="https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&amp;logoColor=white" alt="Chrome extension — installation"></a>
    <a href="manifest.json"><img src="https://img.shields.io/badge/Manifest-V3-brightgreen" alt="Manifest V3"></a>
  </p>
  <p><a href="#installation">نصب</a> · <a href="#testing">تست‌ها</a> · <a href="#english">English guide</a></p>
</div>

<div dir="rtl">

<h2 id="problem">مشکل و هدف افزونه</h2>

<p>در بعضی رابط‌های چت، جهت پایه یا سبک‌های صفحه باعث می‌شود متن فارسی همراه با عبارت‌هایی مثل <code dir="ltr">API</code>، <code dir="ltr">n8n</code> و مسیر فایل‌ها نامرتب دیده شود. افزونه بلوک‌های دارای حروف فارسی یا عربی را شناسایی می‌کند و جهت و تراز آن‌ها را تغییر می‌دهد. نتیجه به ساختار و سبک‌های سایت میزبان بستگی دارد؛ اصلاح همهٔ حالت‌های متن دوزبانه تضمین نمی‌شود.</p>

<h3>نمونه‌های قابل بررسی</h3>

<p>به‌جای تصویر یا جدول نمایشیِ «قبل و بعد»، نمونه‌های واقعی زیر در <a href="tests/mixed-text.html">تست متن ترکیبی</a> و <a href="tests/regressions.html">تست رگرسیون</a> قابل اجرا هستند:</p>

<ul>
  <li>جملهٔ فارسی همراه با مسیر <code dir="ltr">results/validation.tsv</code> و علامت دونقطه: جهت جمله راست‌به‌چپ و جهت کد مستقل و چپ‌به‌راست می‌ماند.</li>
  <li>عبارت <code dir="ltr">50 nm</code> در سلول فارسی: عدد و واحد شناخته‌شده در یک عبارت چپ‌به‌راست قرار می‌گیرند.</li>
  <li>عبارت علمی <code dir="ltr">1e-3 nm</code>: علامت توان، عدد و واحد با هم ایزوله می‌شوند؛ متن قابل کپی و نشانه‌گذاری حفظ می‌شود.</li>
</ul>

<p>این‌ها رفتارهای مورد انتظار و آزموده‌شده در نمونه‌های محلی‌اند، نه تصویر تأییدشده از همهٔ سایت‌های میزبان.</p>

<h2 id="platforms">دامنه‌های فعال</h2>

<p>فهرست زیر از <a href="manifest.json">manifest.json</a> گرفته شده است. وجود دامنه در این فهرست به معنی تنظیم اجرای اسکریپت است؛ سازگاری با تمام نسخه‌ها و بخش‌های آن سایت را تضمین نمی‌کند.</p>

<table dir="ltr">
  <thead><tr><th>Service</th><th>URL pattern</th></tr></thead>
  <tbody>
    <tr><td>Claude</td><td><code>https://claude.ai/*</code></td></tr>
    <tr><td>ChatGPT</td><td><code>https://chatgpt.com/*</code><br><code>https://chat.openai.com/*</code></td></tr>
    <tr><td>Gemini</td><td><code>https://gemini.google.com/*</code></td></tr>
    <tr><td>NotebookLM</td><td><code>https://notebooklm.google.com/*</code></td></tr>
    <tr><td>Qwen Chat</td><td><code>https://chat.qwen.ai/*</code></td></tr>
    <tr><td>Local web pages</td><td><code>http://localhost/*</code></td></tr>
  </tbody>
</table>

<p><strong>دربارهٔ localhost و Claude Science:</strong> افزونه روی صفحات HTTP در <code dir="ltr">localhost</code> که داخل Chrome باز می‌شوند نیز فعال است؛ این دسترسی به برنامهٔ خاصی محدود نیست. اگر رابط وب Claude Science از چنین نشانی‌ای در Chrome باز شود، مشمول همین الگو است. این تنظیم به‌تنهایی به معنی نصب یا اجرای افزونه داخل اپ دسکتاپ نیست و پشتیبانی داخل آن اپ تأیید نشده است. الگوهای <code dir="ltr">https://localhost/*</code> و <code dir="ltr">http://127.0.0.1/*</code> در manifest فعلی وجود ندارند.</p>

<h2 id="features">عملکرد و محدودیت‌ها</h2>

<ul>
  <li><strong>اجرای خودکار:</strong> پس از بارگذاری صفحه، متن اسکن می‌شود و تغییرات متن و عناصر جدید با <code dir="ltr">MutationObserver</code> بررسی می‌شوند؛ دکمهٔ روشن/خاموش وجود ندارد.</li>
  <li><strong>جهت متن:</strong> بلوک‌های واجد شرایط با حروف فارسی یا عربی کلاس راست‌به‌چپ می‌گیرند. عدد فارسی و علامت درصد به‌تنهایی نشانهٔ جملهٔ فارسی نیستند.</li>
  <li><strong>کد و مرزهای جهت:</strong> محتوای <code dir="ltr">pre</code> و <code dir="ltr">code</code> بازنویسی نمی‌شود. کد داخل بلوک اصلاح‌شده سبک چپ‌به‌راست مستقل می‌گیرد. زیرشاخه‌های <code dir="ltr">bdi</code> و <code dir="ltr">bdo</code> نیز از پردازش کنار گذاشته می‌شوند.</li>
  <li><strong>جدول:</strong> سلول‌های جدول دارای بلوک فارسی راست‌چین می‌شوند، بدون تغییر مستقیم جهت خود جدول. عدد و واحد لاتینِ موجود در فهرست کد، همراه با توان علمی اختیاری، در سلول فارسی با عنصر <code dir="ltr">bdi</code> ایزوله می‌شوند. تشخیص به یک گرهٔ متنی محدود است؛ عدد و واحدی که بین چند عنصر قالب‌بندی تقسیم شده‌اند، یک عبارت واحد تشخیص داده نمی‌شوند.</li>
  <li><strong>ویرایشگر:</strong> عناصر <code dir="ltr">contenteditable</code> می‌توانند کلاس جهت بگیرند، اما متن داخل ویرایشگر با عناصر کمکی بازنویسی نمی‌شود. عناصر <code dir="ltr">textarea</code> و <code dir="ltr">input</code> از پردازش کنار گذاشته شده‌اند؛ بنابراین همهٔ باکس‌های تایپ پوشش داده نمی‌شوند.</li>
  <li><strong>پردازش محلی:</strong> کد فعلی افزونه داده‌ای جمع‌آوری، ارسال یا ذخیره نمی‌کند. تغییرات شامل کلاس‌های CSS و، در بعضی سلول‌های جدول، افزودن عناصر <code dir="ltr">bdi</code> به DOM است. مجوز <code dir="ltr">activeTab</code> برای خواندن نشانی تب هنگام کلیک روی آیکون افزونه استفاده می‌شود؛ دسترسی دائمی به تاریخچهٔ مرورگر درخواست نمی‌شود.</li>
  <li><strong>پنجرهٔ افزونه:</strong> popup دامنهٔ تب فعلی را با فهرست manifest مقایسه می‌کند و وضعیت پشتیبانی، نمونهٔ متن ترکیبی، نسخه و لینک راهنما را نشان می‌دهد. این بررسی دامنه است و اجرای موفق اسکریپت یا اصلاح همهٔ متن‌های صفحه را تأیید نمی‌کند.</li>
</ul>

<h2 id="installation">نصب در Chrome</h2>

<p>این راهنما برای نصب دستی نسخهٔ مخزن به‌صورت <span dir="ltr">unpacked</span> است.</p>

<ol>
  <li>از منوی <strong dir="ltr">Code → Download ZIP</strong> مخزن را دانلود و فایل ZIP را استخراج کنید؛ یا با دستور زیر مخزن را کلون کنید.</li>
</ol>

</div>

<div dir="ltr">
<pre><code>git clone https://github.com/Mortal-Esi/ai-chat-persian-rtl-fix.git</code></pre>
</div>

<div dir="rtl">

<ol start="2">
  <li>در Chrome نشانی <code dir="ltr">chrome://extensions</code> را باز کنید.</li>
  <li>گزینهٔ <strong dir="ltr">Developer mode</strong> را فعال کنید.</li>
  <li>روی <strong dir="ltr">Load unpacked</strong> کلیک کنید و پوشه‌ای را انتخاب کنید که فایل <code dir="ltr">manifest.json</code> مستقیماً داخل آن است؛ فایل ZIP یا پوشهٔ والد را انتخاب نکنید.</li>
  <li>صفحهٔ موردنظر در یکی از دامنه‌های بالا را دوباره بارگذاری کنید.</li>
</ol>

<p><strong>پس از به‌روزرسانی کد:</strong> در صفحهٔ افزونه‌ها روی دکمهٔ بارگذاری مجدد همین افزونه کلیک کنید و سپس تب سایت را هم دوباره بارگذاری کنید.</p>

<h2 id="files">فایل‌های اصلی</h2>

<ul>
  <li><a href="content.js"><code dir="ltr">content.js</code></a>: تشخیص متن، مدیریت تغییرات و ایزوله‌سازی عبارت‌های عدد و واحد.</li>
  <li><a href="style.css"><code dir="ltr">style.css</code></a>: سبک‌های جهت و تراز متن، جدول و فهرست.</li>
  <li><a href="manifest.json"><code dir="ltr">manifest.json</code></a>: تنظیمات افزونه و دامنه‌های فعال.</li>
  <li><a href="popup.html"><code dir="ltr">popup.html</code></a>: رابط پنجرهٔ افزونه؛ سبک‌ها در <a href="popup.css"><code dir="ltr">popup.css</code></a> و بررسی دامنه در <a href="popup.js"><code dir="ltr">popup.js</code></a>.</li>
  <li><a href="tests/README.md"><code dir="ltr">tests/</code></a>: نمونه‌های مرورگری، تست‌های رگرسیون و روش اجرای آن‌ها.</li>
</ul>

<h2 id="testing">اجرای تست‌ها</h2>

<p>از ریشهٔ مخزن، با Node.js و Chrome یا Chromium نصب‌شده اجرا کنید. نصب بستهٔ npm لازم نیست.</p>

</div>

<div dir="ltr">
<pre><code>node --test tests/popup.test.cjs
node tests/run-browser.cjs</code></pre>
<p>For a custom Chrome/Chromium path:</p>
<pre><code>CHROME_BIN=/path/to/chrome node tests/run-browser.cjs</code></pre>
</div>

<div dir="rtl">

<p>فرمان دوم برای پوسته‌های سازگار با POSIX، مثل bash و zsh است. تست‌ها اسکریپت و CSS واقعی را روی فایل‌های محلی در Chrome بدون پنجره اجرا می‌کنند. هر دو نمونه باید <code dir="ltr">PASS</code> گزارش کنند؛ شکست تست باعث خروج با کد غیرصفر می‌شود. برای اجرای دستی نیز می‌توانید فایل‌های HTML داخل پوشهٔ تست را در Chrome باز کنید. جزئیات در <a href="tests/README.md">راهنمای تست‌ها</a> آمده است.</p>

<p>تست محلی جای بررسی نصب افزونه و رفتار آن در سایت‌های زنده را نمی‌گیرد. تغییر ساختار یا سبک‌های سایت میزبان ممکن است به اصلاحات بعدی نیاز داشته باشد.</p>

<h2 id="contributing">مشارکت و گزارش اشکال</h2>

<p>برای گزارش مشکل، در <a href="https://github.com/Mortal-Esi/ai-chat-persian-rtl-fix/issues">Issues</a> نام سایت و نسخهٔ Chrome، متن نمونهٔ قابل بازتولید، نتیجهٔ مورد انتظار و نتیجهٔ فعلی را بنویسید. در صورت امکان تصویر و یک نمونهٔ کوچک HTML هم اضافه کنید و اطلاعات شخصی را حذف کنید. برای تغییر کد، تست مرتبط را اجرا و در صورت نیاز نمونهٔ رگرسیون اضافه کنید.</p>

<h2 id="license">مجوز</h2>

<p>این پروژه با <a href="LICENSE">مجوز MIT</a> ارائه شده است؛ استفاده، تغییر و توزیع مطابق شرایط همان مجوز مجاز است.</p>

</div>

<hr>

<div dir="ltr">

<h2 id="english">English guide</h2>

<p>This Chrome extension adjusts eligible Persian/Arabic text blocks in the web interfaces listed above. It applies direction and alignment classes, and inserts LTR <code>bdi</code> elements around recognized quantities in Persian table cells. Scientific notation such as <code>1e-3 nm</code> is handled as one run. It does not guarantee correct layout for every host page or mixed-language case.</p>

<p>Code content and existing <code>bdi</code>/<code>bdo</code> subtrees are excluded from rewriting. Eligible <code>contenteditable</code> elements can receive direction classes, but editor text is not wrapped. <code>textarea</code> and <code>input</code> are excluded. Quantities split across multiple text nodes are not combined. The current code does not collect, transmit, or persist data; the <code>activeTab</code> permission reads the active tab URL when you click the extension icon.</p>

<p>The <code>http://localhost/*</code> match applies to local pages opened in Chrome, including a Claude Science web interface if served there. It does not establish support inside the desktop application. HTTPS localhost and <code>127.0.0.1</code> are not included in the current manifest. The popup compares the active tab domain with the manifest and shows its support status, the extension version, a mixed-text example, and a help link. Domain support does not verify successful content-script execution.</p>

<p><strong>Install:</strong> download and extract the ZIP, or clone this repository. Open <code>chrome://extensions</code>, enable <strong>Developer mode</strong>, choose <strong>Load unpacked</strong>, and select the folder directly containing <code>manifest.json</code>. Reload the target page. After a code update, reload both the extension and the page.</p>

<p><strong>Test:</strong> run <code>node --test tests/popup.test.cjs</code> for popup status and icon checks, and <code>node tests/run-browser.cjs</code> from the repository root with Node.js and Chrome installed. Set <code>CHROME_BIN</code> for a custom browser path. No npm dependencies are required. See <a href="tests/README.md">the test guide</a>. Local fixtures do not verify live host integrations or extension injection.</p>

<p><strong>Report a bug:</strong> include the host site, Chrome version, reproducible sample text, expected and actual behavior, and an optional screenshot or minimal HTML fixture in <a href="https://github.com/Mortal-Esi/ai-chat-persian-rtl-fix/issues">Issues</a>. Remove personal information before sharing.</p>

<p>Licensed under <a href="LICENSE">MIT</a>.</p>

</div>
