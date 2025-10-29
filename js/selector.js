// ========================================
// SELECTOR DE FOTOS - XV AÑOS ALEXA ESMERALDA
// ========================================

const TOTAL_PHOTOS = 86;
const STORAGE_KEY = 'alexa_xv_photo_selections';

// Generate photo paths (foto0001.webp to foto0086.webp)
let photos = [];
for (let i = 1; i <= TOTAL_PHOTOS; i++) {
    photos.push(`images/foto${String(i).padStart(4, '0')}.webp`);
}

// LIMITS FOR ALEXA'S XV AÑOS
const LIMITS = {
    impresion: 80,    // Máximo 80 fotos para impresión
    ampliacion: 1     // Máximo 1 foto para ampliación
    // redes_sociales: sin límite
};
let photoSelections = {};
let currentPhotoIndex = null;
let currentFilter = 'all';

// ========================================
// LOCAL STORAGE FUNCTIONS
// ========================================
function loadSelections() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            photoSelections = JSON.parse(saved);
            console.log('Selecciones cargadas desde localStorage:', photoSelections);
        }
    } catch (error) {
        console.error('Error cargando selecciones:', error);
        photoSelections = {};
    }
}

function saveSelections() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photoSelections));
        console.log('Selecciones guardadas en localStorage');
    } catch (error) {
        console.error('Error guardando selecciones:', error);
        showToast('Error al guardar. Verifica el espacio del navegador.', 'error');
    }
}

function clearAllSelections() {
    if (confirm('¿Estás segura de que quieres borrar TODAS las selecciones? Esta acción no se puede deshacer.')) {
        photoSelections = {};
        saveSelections();
        renderGallery();
        updateStats();
        updateFilterButtons();
        showToast('Todas las selecciones han sido eliminadas', 'success');
    }
}

// ========================================
// STATS FUNCTIONS
// ========================================
function getStats() {
    const stats = {
        ampliacion: 0,
        impresion: 0,
        redes_sociales: 0,
        descartada: 0,
        sinClasificar: photos.length
    };

    Object.values(photoSelections).forEach(selection => {
        if (selection.ampliacion) stats.ampliacion++;
        if (selection.impresion) stats.impresion++;
        if (selection.redes_sociales) stats.redes_sociales++;
        if (selection.descartada) stats.descartada++;
    });

    stats.sinClasificar = photos.length - Object.keys(photoSelections).length;

    return stats;
}

function updateStats() {
    const stats = getStats();

    // Update counters
    document.getElementById('countAmpliacion').textContent = stats.ampliacion;
    document.getElementById('countImpresion').textContent = stats.impresion;
    document.getElementById('countRedesSociales').textContent = stats.redes_sociales;
    document.getElementById('countDescartada').textContent = stats.descartada;
    document.getElementById('countSinClasificar').textContent = stats.sinClasificar;

    // Add warning class if limits exceeded
    const ampliacionCard = document.querySelector('.stat-card.ampliacion');
    const impresionCard = document.querySelector('.stat-card.impresion');

    if (ampliacionCard) {
        if (stats.ampliacion > LIMITS.ampliacion) {
            ampliacionCard.classList.add('exceeded');
        } else {
            ampliacionCard.classList.remove('exceeded');
        }
    }

    if (impresionCard) {
        if (stats.impresion > LIMITS.impresion) {
            impresionCard.classList.add('exceeded');
        } else {
            impresionCard.classList.remove('exceeded');
        }
    }

    // Update featured photo section
    updateFeaturedPhoto();
}

// ========================================
// FEATURED PHOTO FUNCTIONS
// ========================================
function updateFeaturedPhoto() {
    // Sección de fotografía destacada removida
    // Esta función ya no hace nada
}

// ========================================
// CANVAS PROTECTION FUNCTIONS
// ========================================
function loadImageToCanvas(imageSrc, canvas, photoNumber) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // For CORS if needed

        img.onload = function() {
            const ctx = canvas.getContext('2d');

            // Get the container size
            const container = canvas.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Calculate scale to fit image in container
            const scale = Math.min(
                containerWidth / img.width,
                containerHeight / img.height
            );

            // Set canvas display size (CSS)
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = containerHeight + 'px';

            // Set canvas buffer size (actual pixels)
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Draw the image scaled
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Add watermark
            addWatermark(ctx, scaledWidth, scaledHeight, photoNumber);

            resolve();
        };

        img.onerror = function(err) {
            console.error('Error loading image:', imageSrc, err);
            reject(new Error(`Failed to load image: ${imageSrc}`));
        };

        img.src = imageSrc;
    });
}

function addWatermark(ctx, width, height, photoNumber) {
    // Semi-transparent watermark
    ctx.save();

    // Configure watermark style
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = `${Math.floor(width / 20)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add watermark text
    const watermarkText = 'Francisco & Rossy';
    ctx.fillText(watermarkText, width / 2, height / 2);

    // Add smaller photo number in corner
    ctx.font = `${Math.floor(width / 30)}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'left';
    ctx.fillText(`#${photoNumber}`, 20, height - 20);

    ctx.restore();
}

function disableCanvasInteraction(canvas) {
    // Disable right-click
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Disable drag
    canvas.addEventListener('dragstart', e => e.preventDefault());

    // Disable selection
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.mozUserSelect = 'none';
}

// ========================================
// GALLERY FUNCTIONS
// ========================================
function renderGallery() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';

    photos.forEach((photo, index) => {
        const selection = photoSelections[index] || {};
        const hasAny = selection.ampliacion || selection.impresion || selection.redes_sociales || selection.descartada;

        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.index = index;

        // Add category classes
        if (selection.descartada) {
            card.classList.add('has-descartada');
        } else {
            const categories = [];
            if (selection.ampliacion) categories.push('ampliacion');
            if (selection.impresion) categories.push('impresion');
            if (selection.redes_sociales) categories.push('redes_sociales');

            if (categories.length > 1) {
                card.classList.add('has-multiple');
            } else if (categories.length === 1) {
                card.classList.add(`has-${categories[0]}`);
            }
        }

        // Build badges HTML
        let badgesHTML = '';
        if (hasAny) {
            badgesHTML = '<div class="photo-badges">';
            if (selection.ampliacion) badgesHTML += '<span class="badge badge-ampliacion">🖼️ Ampliación</span>';
            if (selection.impresion) badgesHTML += '<span class="badge badge-impresion">📸 Impresión</span>';
            if (selection.redes_sociales) badgesHTML += '<span class="badge badge-redes-sociales">📱 Redes Sociales</span>';
            if (selection.descartada) badgesHTML += '<span class="badge badge-descartada">❌ Descartada</span>';
            badgesHTML += '</div>';
        }

        card.innerHTML = `
            <div class="photo-image-container">
                <img src="${photo}" alt="Foto ${index + 1}" loading="lazy">
            </div>
            <div class="photo-number">Foto ${index + 1}</div>
            ${badgesHTML}
        `;

        card.addEventListener('click', () => openModal(index));
        grid.appendChild(card);
    });

    applyFilter();
}

// ========================================
// FILTER FUNCTIONS
// ========================================
function isPhotoVisible(index) {
    const selection = photoSelections[index] || {};
    let show = false;

    switch (currentFilter) {
        case 'all':
            show = true;
            break;
        case 'ampliacion':
            show = selection.ampliacion === true;
            break;
        case 'impresion':
            show = selection.impresion === true;
            break;
        case 'redes-sociales':
            show = selection.redes_sociales === true;
            break;
        case 'descartada':
            show = selection.descartada === true;
            break;
        case 'sin-clasificar':
            show = !selection.ampliacion && !selection.impresion && !selection.redes_sociales && !selection.descartada;
            break;
    }
    return show;
}

function applyFilter() {
    const cards = document.querySelectorAll('.photo-card');

    cards.forEach(card => {
        const index = parseInt(card.dataset.index);
        card.classList.toggle('hidden', !isPhotoVisible(index));
    });
}

function setFilter(filter) {
    console.log('Setting filter to:', filter);
    currentFilter = filter;
    applyFilter();

    // Update button states
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function updateFilterButtons() {
    const stats = getStats();

    document.getElementById('btnFilterAll').textContent = `Todas (${photos.length})`;
    document.getElementById('btnFilterAmpliacion').textContent = `Ampliación (${stats.ampliacion})`;
    document.getElementById('btnFilterImpresion').textContent = `Impresión (${stats.impresion})`;
    document.getElementById('btnFilterRedesSociales').textContent = `Redes Sociales (${stats.redes_sociales})`;
    document.getElementById('btnFilterDescartada').textContent = `Descartadas (${stats.descartada})`;
    document.getElementById('btnFilterSinClasificar').textContent = `Sin Clasificar (${stats.sinClasificar})`;
}

function findNextVisiblePhoto(startIndex, direction) {
    let newIndex = startIndex;
    const totalPhotos = photos.length;

    if (direction === 'next') {
        for (let i = startIndex + 1; i < totalPhotos; i++) {
            if (isPhotoVisible(i)) {
                return i;
            }
        }
    } else { // 'prev'
        for (let i = startIndex - 1; i >= 0; i--) {
            if (isPhotoVisible(i)) {
                return i;
            }
        }
    }

    return null; // No next/prev visible photo found
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(index) {
    console.log(`Opening modal for index: ${index}, currentFilter: ${currentFilter}`);
    currentPhotoIndex = index;
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalPhotoNumber = document.getElementById('modalPhotoNumber');

    modalImage.src = photos[index];
    modalPhotoNumber.textContent = `Foto ${index + 1}`;

    // Load current selections
    const selection = photoSelections[index] || {};

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        btn.classList.toggle('selected', selection[category] === true);
    });

    // Update navigation button states
    updateNavigationButtons();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('btnPrevPhoto');
    const btnNext = document.getElementById('btnNextPhoto');

    if (btnPrev && btnNext) {
        const prevIndex = findNextVisiblePhoto(currentPhotoIndex, 'prev');
        const nextIndex = findNextVisiblePhoto(currentPhotoIndex, 'next');

        btnPrev.disabled = prevIndex === null;
        btnPrev.style.opacity = prevIndex === null ? '0.3' : '1';
        btnPrev.style.cursor = prevIndex === null ? 'not-allowed' : 'pointer';

        btnNext.disabled = nextIndex === null;
        btnNext.style.opacity = nextIndex === null ? '0.3' : '1';
        btnNext.style.cursor = nextIndex === null ? 'not-allowed' : 'pointer';
    }
}

function hasUnsavedChanges() {
    if (currentPhotoIndex === null) return false;

    const savedSelection = photoSelections[currentPhotoIndex] || {};
    const currentSelection = {};
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        currentSelection[btn.dataset.category] = true;
    });

    const savedKeys = Object.keys(savedSelection).filter(k => savedSelection[k]);
    const currentKeys = Object.keys(currentSelection);

    if (savedKeys.length !== currentKeys.length) return true;

    const allKeys = new Set([...savedKeys, ...currentKeys]);

    for (const key of allKeys) {
        if (!!savedSelection[key] !== !!currentSelection[key]) {
            return true;
        }
    }

    return false;
}

function navigatePhoto(direction) {
    console.log(`Navigating photo: ${direction}`);
    if (currentPhotoIndex === null) return;

    const proceed = () => {
        const newIndex = findNextVisiblePhoto(currentPhotoIndex, direction);
        console.log(`findNextVisiblePhoto returned: ${newIndex}`);

        if (newIndex !== null) {
            currentPhotoIndex = newIndex;
            const modalImage = document.getElementById('modalImage');
            const modalPhotoNumber = document.getElementById('modalPhotoNumber');

            modalImage.src = photos[newIndex];
            modalPhotoNumber.textContent = `Foto ${newIndex + 1}`;

            const selection = photoSelections[newIndex] || {};
            document.querySelectorAll('.option-btn').forEach(btn => {
                const category = btn.dataset.category;
                btn.classList.toggle('selected', selection[category] === true);
            });

            updateNavigationButtons();
        }
    };

    if (hasUnsavedChanges()) {
        if (confirm('¿Deseas guardar los cambios antes de continuar?')) {
            saveModalSelection(proceed);
        } else {
            proceed();
        }
    } else {
        proceed();
    }
}

function closeModal() {
    const doClose = () => {
        const modal = document.getElementById('photoModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPhotoIndex = null;
    };

    if (hasUnsavedChanges()) {
        if (confirm('¿Deseas guardar los cambios antes de salir?')) {
            saveModalSelection(doClose);
        } else {
            doClose();
        }
    } else {
        doClose();
    }
}

function saveModalSelection(callback) {
    if (currentPhotoIndex === null) return;

    const selectedCategories = {};
    let hasAnySelection = false;

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        const isSelected = btn.classList.contains('selected');
        selectedCategories[category] = isSelected;
        if (isSelected) hasAnySelection = true;
    });

    // Only save if there's at least one selection
    if (hasAnySelection) {
        photoSelections[currentPhotoIndex] = selectedCategories;
    } else {
        // Remove from selections if nothing is selected
        delete photoSelections[currentPhotoIndex];
    }

    saveSelections();
    renderGallery();
    updateStats();
    updateFilterButtons();
    showToast('Selección guardada correctamente', 'success');

    if (callback && typeof callback === 'function') {
        callback();
    } else {
        closeModal();
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportToJSON() {
    const exportData = {
        INSTRUCCIONES: '⚠️ IMPORTANTE: Por favor envía este archivo por WhatsApp al 4779203776',
        whatsapp: '4779203776',
        fecha_exportacion: new Date().toISOString(),
        evento: 'XV Años - Alexa Esmeralda',
        total_fotos: photos.length,
        estadisticas: getStats(),
        selecciones: []
    };

    photos.forEach((photo, index) => {
        const selection = photoSelections[index];
        if (selection && (selection.ampliacion || selection.impresion || selection.redes_sociales || selection.descartada)) {
            exportData.selecciones.push({
                numero_foto: index + 1,
                archivo: photo,
                ampliacion: selection.ampliacion || false,
                impresion: selection.impresion || false,
                redes_sociales: selection.redes_sociales || false,
                descartada: selection.descartada || false
            });
        }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seleccion-alexa-xv-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('📥 Reporte descargado. ¡Envíalo por WhatsApp al 4779203776!', 'success');
}

function generateTextSummary() {
    const stats = getStats();
    let summary = '👑 SELECCIÓN DE FOTOS - XV AÑOS ALEXA ESMERALDA\n';
    summary += '═══════════════════════════════════════\n\n';
    summary += `📊 RESUMEN GENERAL:\n`;
    summary += `   Total de fotos: ${photos.length}\n`;
    summary += `   🖼️  Para ampliación: ${stats.ampliacion}\n`;
    summary += `   📸 Para impresión: ${stats.impresion}\n`;
    summary += `   📱 Para redes sociales: ${stats.redes_sociales}\n`;
    summary += `   ❌ Descartadas: ${stats.descartada}\n`;
    summary += `   ⭕ Sin clasificar: ${stats.sinClasificar}\n\n`;

    const categories = ['ampliacion', 'impresion', 'redes_sociales', 'descartada'];
    const categoryNames = {
        ampliacion: '🖼️  AMPLIACIÓN',
        impresion: '📸 IMPRESIÓN',
        redes_sociales: '📱 REDES SOCIALES',
        descartada: '❌ DESCARTADAS'
    };

    categories.forEach(category => {
        const photosInCategory = [];
        photos.forEach((photo, index) => {
            const selection = photoSelections[index];
            if (selection && selection[category]) {
                photosInCategory.push(index + 1);
            }
        });

        if (photosInCategory.length > 0) {
            summary += `${categoryNames[category]}:\n`;
            summary += `   Fotos: ${photosInCategory.join(', ')}\n`;
            summary += `   Total: ${photosInCategory.length}\n\n`;
        }
    });

    summary += `\n📅 Generado el: ${new Date().toLocaleString('es-MX')}\n`;

    return summary;
}

function copyToClipboard() {
    const summary = generateTextSummary();

    navigator.clipboard.writeText(summary).then(() => {
        showToast('Resumen copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Resumen copiado al portapapeles', 'success');
    });
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Iniciando selector de fotos - Alexa Esmeralda XV Años');
    console.log(`📸 Total de fotos: ${TOTAL_PHOTOS}`);

    // Load saved selections
    loadSelections();
    console.log('✅ Selecciones cargadas:', Object.keys(photoSelections).length);

    // Render gallery
    renderGallery();

    // Update stats
    updateStats();

    // Update filter buttons
    updateFilterButtons();

    // Filter buttons
    document.getElementById('btnFilterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('btnFilterAmpliacion').addEventListener('click', () => setFilter('ampliacion'));
    document.getElementById('btnFilterImpresion').addEventListener('click', () => setFilter('impresion'));
    document.getElementById('btnFilterRedesSociales').addEventListener('click', () => setFilter('redes-sociales'));
    document.getElementById('btnFilterDescartada').addEventListener('click', () => setFilter('descartada'));
    document.getElementById('btnFilterSinClasificar').addEventListener('click', () => setFilter('sin-clasificar'));

    // Set data-filter attributes
    document.getElementById('btnFilterAll').dataset.filter = 'all';
    document.getElementById('btnFilterAmpliacion').dataset.filter = 'ampliacion';
    document.getElementById('btnFilterImpresion').dataset.filter = 'impresion';
    document.getElementById('btnFilterRedesSociales').dataset.filter = 'redes-sociales';
    document.getElementById('btnFilterDescartada').dataset.filter = 'descartada';
    document.getElementById('btnFilterSinClasificar').dataset.filter = 'sin-clasificar';

    // Set initial active filter
    document.getElementById('btnFilterAll').classList.add('active');

    // Action buttons
    document.getElementById('btnExport').addEventListener('click', exportToJSON);
    document.getElementById('btnShare').addEventListener('click', copyToClipboard);
    document.getElementById('btnClear').addEventListener('click', clearAllSelections);

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelSelection').addEventListener('click', closeModal);
    document.getElementById('btnSaveSelection').addEventListener('click', saveModalSelection);

    // Option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const isCurrentlySelected = btn.classList.contains('selected');

            // If selecting descartada, deselect all others
            if (category === 'descartada' && !isCurrentlySelected) {
                document.querySelectorAll('.option-btn').forEach(b => {
                    if (b !== btn) b.classList.remove('selected');
                });
            }

            // If selecting any other, deselect descartada
            if (category !== 'descartada' && !isCurrentlySelected) {
                const descartadaBtn = document.querySelector('.option-btn[data-category="descartada"]');
                if (descartadaBtn) descartadaBtn.classList.remove('selected');
            }

            btn.classList.toggle('selected');

            // Show warning if exceeding recommended limit (but allow it)
            if (!isCurrentlySelected && LIMITS[category]) {
                const stats = getStats();
                const futureCount = stats[category] + 1;
                if (futureCount > LIMITS[category]) {
                    const messages = {
                        impresion: `⚠️ Nota: Has seleccionado ${futureCount} fotos para impresión (se recomiendan ${LIMITS.impresion})`,
                        ampliacion: `⚠️ Nota: Has seleccionado ${futureCount} fotos para ampliación (se recomienda ${LIMITS.ampliacion})`
                    };
                    showToast(messages[category], 'warning');
                }
            }
        });
    });

    // Close modal on outside click
    document.getElementById('photoModal').addEventListener('click', (e) => {
        if (e.target.id === 'photoModal') {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('photoModal');
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'Enter') {
                saveModalSelection();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigatePhoto('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigatePhoto('next');
            }
        }
    });

    // Navigation button click handlers
    document.getElementById('btnPrevPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('prev');
    });

    document.getElementById('btnNextPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('next');
    });

    console.log('✅ ¡Selector de fotos inicializado correctamente!');
});

// ========================================
// AUTO-SAVE ON VISIBILITY CHANGE
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Página oculta - guardando selecciones...');
        saveSelections();
    }
});

// ========================================
// BEFORE UNLOAD WARNING
// ========================================
window.addEventListener('beforeunload', (e) => {
    saveSelections();
});
