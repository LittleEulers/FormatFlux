const imageInput = document.getElementById('imageInput');
const targetFormat = document.getElementById('targetFormat');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const convertBtn = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');
const previewWrap = document.getElementById('previewWrap');
const previewImage = document.getElementById('previewImage');

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

  const format = targetFormat.value;
  const mimeType = `image/${format}`;
  const quality = Number(qualitySlider.value) / 100;

  statusEl.textContent = 'Converting...';

  try {
    const bitmap = await createImageBitmap(selectedFile);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise((resolve) => {
      if (['image/jpeg', 'image/webp'].includes(mimeType)) {
        canvas.toBlob(resolve, mimeType, quality);
      } else {
        canvas.toBlob(resolve, mimeType);
      }
    });

    if (!blob) {
      throw new Error('Browser could not generate the selected format.');
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFileName}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    statusEl.textContent = `Done! Downloaded ${link.download}.`;
  } catch (error) {
    statusEl.textContent = `Conversion failed: ${error.message}`;
  }
});
