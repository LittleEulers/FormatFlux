FormatFluxAuth.requireAuth();
FormatFluxAuth.wireLogout('logoutBtn');

const imageInput = document.getElementById('imageInput');
const targetFormat = document.getElementById('targetFormat');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const convertBtn = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');
const previewWrap = document.getElementById('previewWrap');
const previewImage = document.getElementById('previewImage');
const selectedFormatChip = document.getElementById('selectedFormatChip');
const converterTags = document.getElementById('converterTags');

const formatOptions = [
  { ext: '3fr', mime: 'image/x-hasselblad-3fr' }, { ext: 'arw', mime: 'image/x-sony-arw' },
  { ext: 'avif', mime: 'image/avif' }, { ext: 'bmp', mime: 'image/bmp' },
  { ext: 'cr2', mime: 'image/x-canon-cr2' }, { ext: 'cr3', mime: 'image/x-canon-cr3' },
  { ext: 'crw', mime: 'image/x-canon-crw' }, { ext: 'dcr', mime: 'image/x-kodak-dcr' },
  { ext: 'dng', mime: 'image/x-adobe-dng' }, { ext: 'eps', mime: 'application/postscript' },
  { ext: 'gif', mime: 'image/gif' }, { ext: 'heic', mime: 'image/heic' },
  { ext: 'heif', mime: 'image/heif' }, { ext: 'icns', mime: 'image/icns' },
  { ext: 'ico', mime: 'image/x-icon' }, { ext: 'jfif', mime: 'image/jpeg' },
  { ext: 'jpeg', mime: 'image/jpeg' }, { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'nef', mime: 'image/x-nikon-nef' }, { ext: 'odd', mime: 'application/odd' },
  { ext: 'odg', mime: 'application/vnd.oasis.opendocument.graphics' }, { ext: 'orf', mime: 'image/x-olympus-orf' },
  { ext: 'pef', mime: 'image/x-pentax-pef' }, { ext: 'png', mime: 'image/png' },
  { ext: 'ppm', mime: 'image/x-portable-pixmap' }, { ext: 'ps', mime: 'application/postscript' },
  { ext: 'psb', mime: 'image/vnd.adobe.photoshop' }, { ext: 'psd', mime: 'image/vnd.adobe.photoshop' },
  { ext: 'raf', mime: 'image/x-fuji-raf' }, { ext: 'raw', mime: 'image/x-panasonic-raw' },
  { ext: 'rw2', mime: 'image/x-panasonic-rw2' }, { ext: 'tga', mime: 'image/x-targa' },
  { ext: 'tif', mime: 'image/tiff' }, { ext: 'tiff', mime: 'image/tiff' },
  { ext: 'webp', mime: 'image/webp' }, { ext: 'x3f', mime: 'image/x-sigma-x3f' },
  { ext: 'xcf', mime: 'image/x-xcf' }, { ext: 'xps', mime: 'application/oxps' },
];

for (const format of formatOptions) {
  const option = document.createElement('option');
  option.value = format.ext;
  option.textContent = format.ext.toUpperCase();
  targetFormat.appendChild(option);

  const tag = document.createElement('span');
  tag.textContent = format.ext.toUpperCase();
  converterTags.appendChild(tag);
}

targetFormat.value = 'png';
selectedFormatChip.textContent = 'PNG';

let selectedFile = null;
let originalFileName = 'converted-image';

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
});

targetFormat.addEventListener('change', () => {
  selectedFormatChip.textContent = targetFormat.value.toUpperCase();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  selectedFile = file;
  originalFileName = file.name.replace(/\.[^/.]+$/, '');
  convertBtn.disabled = false;
  statusEl.textContent = `Loaded: ${file.name}`;

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.src = event.target?.result;
    previewWrap.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

const canvasSupportedMap = {
  png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp',
  gif: 'image/gif', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', avif: 'image/avif', jfif: 'image/jpeg',
};

convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  const ext = targetFormat.value;
  const mimeType = canvasSupportedMap[ext];
  const quality = Number(qualitySlider.value) / 100;

  if (!mimeType) {
    statusEl.textContent = `Conversion to ${ext.toUpperCase()} currently needs a server-side codec; browser-only export is unavailable.`;
    return;
  }

  statusEl.textContent = `Converting to ${ext.toUpperCase()}...`;

  try {
    const bitmap = await createImageBitmap(selectedFile);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise((resolve) => {
      if (['image/jpeg', 'image/webp', 'image/avif'].includes(mimeType)) {
        canvas.toBlob(resolve, mimeType, quality);
      } else {
        canvas.toBlob(resolve, mimeType);
      }
    });

    if (!blob || blob.type !== mimeType) {
      throw new Error(`${ext.toUpperCase()} is not supported by your browser for canvas export.`);
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFileName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    statusEl.textContent = `Done! Downloaded ${link.download}.`;
  } catch (error) {
    statusEl.textContent = `Conversion failed: ${error.message}`;
  }
});
