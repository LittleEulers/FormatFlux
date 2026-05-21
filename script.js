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

const formatOptions = [
  { ext: 'png', mime: 'image/png' },
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'webp', mime: 'image/webp' },
  { ext: 'avif', mime: 'image/avif' },
  { ext: 'gif', mime: 'image/gif' },
  { ext: 'bmp', mime: 'image/bmp' },
  { ext: 'tiff', mime: 'image/tiff' },
  { ext: 'ico', mime: 'image/x-icon' },
  { ext: 'jp2', mime: 'image/jp2' },
  { ext: 'jxl', mime: 'image/jxl' },
  { ext: 'heic', mime: 'image/heic' },
  { ext: 'heif', mime: 'image/heif' },
];

for (const format of formatOptions) {
  const option = document.createElement('option');
  option.value = format.mime;
  option.textContent = format.ext.toUpperCase();
  targetFormat.appendChild(option);
}

let selectedFile = null;
let originalFileName = 'converted-image';

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
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

convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  const mimeType = targetFormat.value;
  const ext = formatOptions.find((f) => f.mime === mimeType)?.ext || 'img';
  const quality = Number(qualitySlider.value) / 100;

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

    if (!blob || !blob.type || blob.type !== mimeType) {
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
