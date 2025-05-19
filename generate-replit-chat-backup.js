const containerSelector = ".useView_view__C2mnv.css-1gpzil";
const chatSelector = ".useView_view__C2mnv.css-1frzmcz";
const projectNameSelector = '[data-cy="header-repl-title"]';
const avatarImageSelector = 'img[alt="jhonnymorales1"]';

// #region [OUTER-SCOPE]

const now = new Date();

async function getAllFontsAsDataURIs() {
  const fontCSS = [];

  for (const sheet of document.styleSheets) {
    let rules;

    try {
      rules = sheet.cssRules;
    } catch {
      // Algunas hojas externas no permiten acceso por CORS
      continue;
    }

    for (const rule of rules) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        const cssText = rule.cssText;

        const matches = [...cssText.matchAll(/url\(["']?([^)"']+)["']?\)/g)];
        if (matches.length === 0) continue;

        for (const match of matches) {
          const originalUrl = match[1];

          try {
            const response = await fetch(originalUrl);
            if (!response.ok) throw new Error("Fetch failed");

            const blob = await response.blob();
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            fontCSS.push({ originalUrl, base64 });
          } catch (e) {
            console.warn("No se pudo convertir fuente:", originalUrl, e);
          }
        }
      }
    }
  }

  return fontCSS;
}

async function fetchStylesheet(link) {
  try {
    const response = await fetch(link.href);
    const css = await response.text();

    return `<style data-stylesheet>${css}</style>`;
  } catch (e) {
    console.warn("No se pudo obtener", link.href, e);
    return link.outerHTML;
  }
}

function cleanInvalidCSSProperties(cssText) {
  // Elimina propiedades vacías como "outline-style: ;"
  return cssText.replace(/[\w-]+\s*:\s*;\s*/g, "");
}

async function extractAllStyles() {
  const fontDataURIs = await getAllFontsAsDataURIs();
  const nodes = [...document.querySelectorAll('style, link[rel="stylesheet"]')];
  let cssText = "";

  for (const node of nodes) {
    if (node.tagName === "LINK") {
      cssText += (await fetchStylesheet(node)) + "\n";
      continue;
    }

    if (node.textContent.trim()) {
      cssText += `<style>${node.textContent}</style>\n`;
      continue;
    }

    const sheet = node.sheet;
    if (!sheet) continue;

    try {
      const rules = [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      cssText += `<style>${rules}</style>\n`;
    } catch (e) {
      console.warn("No se pudo acceder a las reglas de estilo:", e);
    }
  }

  fontDataURIs.forEach(({ originalUrl, base64 }) => {
    cssText = cssText.replace(originalUrl, base64);
  });

  return cleanInvalidCSSProperties(cssText);
}

function getTimestampedName(prefix) {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return `${prefix}-${yyyy}-${mm}-${dd}`;
}

function cleanCdnImageUrlPreserveFormat(url) {
  return url.replace(/cdn-cgi\/image\/([^/]+)/, (_, params) => {
    const cleanedParams = params
      .split(",")
      .filter((p) => !p.startsWith("width=") && !p.startsWith("quality="))
      .join(",");
    return `cdn-cgi/image/${cleanedParams}`;
  });
}

function newCdnImage(imgElement, className) {
  const image = imgElement.cloneNode();

  if (className) image.classList.add(className);
  image.removeAttribute("srcset");
  image.removeAttribute("sizes");
  image.removeAttribute("loading");
  image.removeAttribute("decoding");
  image.removeAttribute("style");
  image.setAttribute("alt", "jhonnymorales1");

  const newImageSrc = cleanCdnImageUrlPreserveFormat(image.src);
  return image.outerHTML.replace(image.src, newImageSrc);
}

function getFormattedDate() {
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

// #endregion

// #region [INNER-SCOPE]

const modalStyle = `
    <style>
      .css-1kw38rn { pointer-events: var(--pointerEvents); font-family: var(--font-family-default); z-index: 100000; font-size: var(--font-size-small); }
      .css-1kw38rn[data-popper-reference-hidden="true"] { opacity: 0; pointer-events: var(--pointerEvents); }
      .css-1x997ni { box-shadow: var(--shadow-1); border: 1px solid var(--border); border-radius: var(--border-radius-4); overflow: hidden; opacity: 0.999; }
      .css-ijrwcs { padding: var(--space-4); flex-direction: row; gap: var(--space-4); -webkit-box-align: center; align-items: center; color: var(--foreground-default); font-size: var(--font-size-small); background-color: var(--background); }
      @supports (not (gap: 4px)) {
        .css-ijrwcs > * { margin-right: var(--space-4); }
        .css-ijrwcs > :last-child { margin-right: 0px; }
      }
      .css-1turnz5 { max-width: 100%; text-align: center; }
      .css-1g64b4x { position: fixed; inset: 0px; overflow: auto; display: block; background-color: var(--background-overlay); transition: opacity 100ms; opacity: 0; padding: var(--space-16); app-region: no-drag; }
      @media screen and (min-width: 512px) {
        .css-1g64b4x { padding-bottom: var(--space-64); }
      }
      .css-1g64b4x[data-centered="true"] { display: flex; -webkit-box-align: center; align-items: center; }
      .css-u8yi00 { -webkit-box-flex: 1; flex-grow: 1; flex-shrink: 1; outline: none; position: relative; border-radius: var(--border-radius-container); border: 1px solid var(--background-highest); }
      .css-8uf1sp { border-radius: calc(var(--border-radius-container) - 1px); height: auto; border-left: none; }
      .css-lmk5p8 { border-radius: calc(var(--border-radius-container) - 1px); height: auto; border-left: none; }
      .css-10jnsp6 { position: absolute; z-index: 100001; }
      .css-7u4any { border: 1px solid transparent; background: transparent; color: inherit; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; line-height: normal; app-region: no-drag; user-select: none; transition-property: box-shadow; transition-duration: 120ms; transition-timing-function: ease-out; border-radius: var(--border-radius-4); -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; width: var(--width); height: var(--height); position: absolute; z-index: 100001; }
      @media (hover: hover) {
        .css-7u4any:not([disabled], [aria-disabled]) { cursor: pointer; }
        .css-7u4any:not([disabled], [aria-disabled]):focus { outline: 2px solid var(--accent-primary-default); outline-offset: -2px; }
        .css-7u4any:not([disabled], [aria-disabled]):focus:not(:focus-visible) { outline-color: transparent; }
        .css-7u4any:not([disabled], [aria-disabled]):hover { background-color: var(--interactive-background); transition-duration: 0ms; }
        .css-7u4any:not([disabled], [aria-disabled]):not(textarea):active { background-color: var(--interactive-background--active); border-color: var(--accent-primary-default); }
      }
      .css-7u4any:disabled, .css-7u4any[aria-disabled="true"] { color: var(--foreground-dimmest); }
      .css-1toa3fe { max-height: 80vh; overflow-y: auto; }
      .css-xi606m { text-align: center; }
      .css-8czvba { -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; padding-left: var(--space-8); padding-right: var(--space-8); -webkit-box-flex: 1; flex-grow: 1; display: flex; flex-direction: column; }
      .css-20sca8 { -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; width: auto; height: auto; min-width: 200px; min-height: 200px; padding: var(--space-16); }
      .css-q1lap6 { width: 80%; height: 80%; object-fit: contain; image-rendering: pixelated; }
    </style>
`;

const modalElement = `
    <div id="image-preview" data-replit-is-modal="true" data-centered="true" class="css-1g64b4x" style="opacity: 0; z-index: -1;">
      <div class="css-u8yi00" style="width: 100%; max-width: 800px; margin: auto; box-shadow: var(--shadow-2);">
        <div class=" useView_view__C2mnv css-lmk5p8 Surface_surfaceDefault__TcNI5" aria-label="Dialog" role="dialog" tabindex="-1" style="padding: var(--space-16);">
          <button data-cy="close-modal" class=" useView_view__C2mnv css-7u4any" type="button" aria-label="Close" style="--height: 24px; --width: 24px; top: var(--space-8); right: var(--space-8);">
            <svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path>
            </svg>
          </button>
          <div class=" useView_view__C2mnv css-1toa3fe" style="--useView--gap: 8px; --useView--pt: 16px; --useView--pr: 16px; --useView--pb: 16px; --useView--pl: 16px;">
            <span class=" useView_view__C2mnv css-xi606m Text_text__T_hn_ Text_multiline__ICkLz" style="--Text--font-family: inherit; --Text--font-size: var(--font-size-subhead-default); --Text--line-height: var(--line-height-subhead-default); --Text--font-weight: var(--font-weight-medium);">
              Attached Image
            </span>
            <div class=" useView_view__C2mnv css-8czvba" style="--useView--gap: 4px;">
              <div class=" useView_view__C2mnv css-20sca8">
                <img alt="Preview" src="" class="css-q1lap6">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
`;

const modifiedCSSRules4Print = `
        .Events_eventContainer__sKam9 .Surface_surfaceHigher__glqx6:not(.css-liy9s4),
        .Events_eventContainer__sKam9 .CheckpointCard_root__uJ1Ha { page-break-inside: avoid; break-inside: avoid; }
`;

function saveHtmlFile(filename) {
  document.querySelectorAll("img").forEach((imgElement) => {
    imgElement.removeAttribute("srcset");
    imgElement.removeAttribute("sizes");
    imgElement.removeAttribute("loading");
    imgElement.removeAttribute("decoding");
  });

  const blob = new Blob([document.documentElement.outerHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function convertImageToDataURL(imgElement) {
  // Si ya es base64, salir
  if (imgElement.src.startsWith("data:")) return;

  fetch(imgElement.src, {
    mode: "cors",
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.blob();
    })
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => (imgElement.src = reader.result);
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error en conversión:", error);
      // Mantener la imagen original si falla
    });
}

function ready(htmlStyle) {
  const rootElement = document.documentElement;
  const modal = document.querySelector("#image-preview");
  const images = document.querySelectorAll('img[alt="Attached Image"]');
  const screenshotsAndAvatar = document.querySelectorAll(
    'img[alt="Screenshot"], img[alt="jhonnymorales1"]'
  );

  modal.querySelector('button[data-cy="close-modal"]').addEventListener("click", function () {
    rootElement.setAttribute("style", htmlStyle);
    modal.style.opacity = 0;
    modal.style.zIndex = -1;
  });

  images.forEach((img) => {
    img.closest("button").addEventListener("click", function () {
      const imgSrc = img.getAttribute("src");
      const imgPreview = document.querySelector('img[alt="Preview"]');

      imgPreview.setAttribute("src", imgSrc);
      rootElement.setAttribute("style", htmlStyle + "padding-right: 0px; overflow: hidden;");
      modal.style.opacity = 1;
      modal.style.zIndex = 100000;
    });
  });

  screenshotsAndAvatar.forEach((img) => {
    if (img.complete) convertImageToDataURL(img);
    else
      img.onload = function () {
        convertImageToDataURL(this);
      };
  });
}

// #endregion

async function chatWindow() {
  const popup = window.open("", "", "width=800,height=600");

  const htmlStyle = document.documentElement.getAttribute("style");
  const chatContent = document.querySelector(chatSelector).innerHTML;
  const headStyles = await extractAllStyles();
  const containerStyle = document.querySelector(containerSelector).getAttribute("style");
  const documentName = getTimestampedName("replit-chat-backup");
  const projectNameElement = document.querySelector(projectNameSelector);
  const proyectName = projectNameElement.textContent;

  const proyectImageString = newCdnImage(
    projectNameElement.previousElementSibling.querySelector("img:not([aria-hidden])"),
    "cover-image"
  );

  const avatarImageString = newCdnImage(document.querySelector(avatarImageSelector));

  popup.document.write(`
<html style="${htmlStyle}">
  <head>
    <title>${documentName}</title>
    ${headStyles}
    ${modalStyle}
    <style>
      body { margin: 0; padding: 0; overflow: inherit; }
      .pdf-cover{ display:none; height:100vh; padding:2rem; background-color:#0d1117; color:#fff; page-break-after:always; text-align:center; }
      .cover-title{ font-size:2rem; font-weight:600; margin-bottom:2rem; }
      .cover-image{ max-width:400px; border:2px solid #444; border-radius:8px; box-shadow:0 0 20px rgba(0,255,255,.3); margin-bottom:1rem; }
      .cover-edition{ font-style:italic; margin-bottom:3rem; color:#9ca3af; }
      .cover-date{ font-size:.75rem; color:#6b7280; margin-top:-1rem; margin-bottom:3rem; }
      .cover-footer{ display:flex; gap:2rem; align-items:center; justify-content:center; }
      .cover-footer img,.cover-footer svg{ width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #ffffff22; background-color:#1f2937; padding:4px; }
      @media print {
        #fab-container { display:none !important; }
        .pdf-cover{ display:block !important; }
        ${modifiedCSSRules4Print}
      }
    </style>
    <script>
      ${String(saveHtmlFile)}
      ${String(convertImageToDataURL)}
    </script>
  </head>
  <body>
    <div class="pdf-cover">
      <div class="cover-title">Team Sync: ${proyectName}</div>
      ${proyectImageString}
      <div class="cover-edition">First Edition</div>
      <div class="cover-date">${getFormattedDate()}</div>
      <div class="cover-footer">
        <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
          <path d="M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12H8.5C7.67157 12 7 11.3284 7 10.5V5.5Z" fill="#F26207"></path>
          <path d="M17 12H25.5C26.3284 12 27 12.6716 27 13.5V18.5C27 19.3284 26.3284 20 25.5 20H17V12Z" fill="#F26207"></path>
          <path d="M7 21.5C7 20.6716 7.67157 20 8.5 20H17V26.5C17 27.3284 16.3284 28 15.5 28H8.5C7.67157 28 7 27.3284 7 26.5V21.5Z" fill="#F26207"></path>
        </svg>
        <svg width="28" viewBox="0 0 156 154" fill="none">
          <path d="M59.7325 56.1915V41.6219C59.7325 40.3948 60.1929 39.4741 61.266 38.8613L90.5592 21.9915C94.5469 19.6912 99.3013 18.6181 104.208 18.6181C122.612 18.6181 134.268 32.8813 134.268 48.0637C134.268 49.1369 134.268 50.364 134.114 51.5911L103.748 33.8005C101.908 32.7274 100.067 32.7274 98.2267 33.8005L59.7325 56.1915ZM128.133 112.937V78.1222C128.133 75.9745 127.212 74.441 125.372 73.3678L86.878 50.9768L99.4538 43.7682C100.527 43.1554 101.448 43.1554 102.521 43.7682L131.814 60.6381C140.25 65.5464 145.923 75.9745 145.923 86.0961C145.923 97.7512 139.023 108.487 128.133 112.935V112.937ZM50.6841 82.2638L38.1083 74.9028C37.0351 74.29 36.5748 73.3693 36.5748 72.1422V38.4025C36.5748 21.9929 49.1506 9.5696 66.1744 9.5696C72.6162 9.5696 78.5962 11.7174 83.6585 15.5511L53.4461 33.0352C51.6062 34.1084 50.6855 35.6419 50.6855 37.7897V82.2653L50.6841 82.2638ZM77.7533 97.9066L59.7325 87.785V66.3146L77.7533 56.193L95.7725 66.3146V87.785L77.7533 97.9066ZM89.3321 144.53C82.8903 144.53 76.9103 142.382 71.848 138.549L102.06 121.064C103.9 119.991 104.821 118.458 104.821 116.31V71.8343L117.551 79.1954C118.624 79.8082 119.084 80.7289 119.084 81.956V115.696C119.084 132.105 106.354 144.529 89.3321 144.529V144.53ZM52.9843 110.33L23.6911 93.4601C15.2554 88.5517 9.58181 78.1237 9.58181 68.0021C9.58181 56.193 16.6365 45.611 27.5248 41.163V76.1299C27.5248 78.2776 28.4455 79.8111 30.2854 80.8843L68.6271 103.121L56.0513 110.33C54.9781 110.943 54.0574 110.943 52.9843 110.33ZM51.2983 135.482C33.9681 135.482 21.2384 122.445 21.2384 106.342C21.2384 105.115 21.3923 103.888 21.5448 102.661L51.7572 120.145C53.5971 121.218 55.4385 121.218 57.2784 120.145L95.7725 97.9081V112.478C95.7725 113.705 95.3122 114.625 94.239 115.238L64.9458 132.108C60.9582 134.408 56.2037 135.482 51.2969 135.482H51.2983ZM89.3321 153.731C107.889 153.731 123.378 140.542 126.907 123.058C144.083 118.61 155.126 102.507 155.126 86.0976C155.126 75.3617 150.525 64.9336 142.243 57.4186C143.01 54.1977 143.471 50.9768 143.471 47.7573C143.471 25.8267 125.68 9.41567 105.129 9.41567C100.989 9.41567 97.0011 10.0285 93.0134 11.4095C86.1112 4.66126 76.6024 0.367188 66.1744 0.367188C47.6171 0.367188 32.1282 13.5558 28.5994 31.0399C11.4232 35.4879 0.380859 51.5911 0.380859 68.0006C0.380859 78.7365 4.98133 89.1645 13.2631 96.6795C12.4963 99.9004 12.036 103.121 12.036 106.341C12.036 128.271 29.8265 144.682 50.3777 144.682C54.5178 144.682 58.5055 144.07 62.4931 142.689C69.3938 149.437 78.9026 153.731 89.3321 153.731Z" fill="currentColor"></path>
        </svg>
        ${avatarImageString}
      </div>
    </div>
    <div style="${containerStyle}">${chatContent}</div>
    <div id="fab-container" style="position:fixed;bottom:1.5rem;right:1.5rem;display:flex;flex-direction:column;gap:.75rem;z-index:9999">
      <button onclick="window.print();" style="background-color:#007bff;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;font-size:20px" title="print">
      🖨️
      </button>
      <button onclick="saveHtmlFile('${documentName}.html');" style="background-color:#28a745;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;font-size:20px" title="download">
      💾
      </button>
    </div>
    ${modalElement}
    <script>
      (${String(ready)})("${htmlStyle}");
    </script>
  </body>
</html>
  `);

  popup.focus();
}

chatWindow();
