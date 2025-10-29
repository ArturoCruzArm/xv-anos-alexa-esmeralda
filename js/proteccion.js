// ========================================
// PROTECCIÓN DE IMÁGENES - EVITAR DESCARGA
// ========================================

(function() {
    'use strict';

    // Deshabilitar clic derecho en imágenes, canvas e iframes
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS' || e.target.tagName === 'IFRAME' || e.target.closest('iframe')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Proteger iframes (video)
    function protegerIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(function(iframe) {
            // Crear una capa transparente sobre el iframe para prevenir interacciones
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;';

            const parent = iframe.parentElement;
            if (parent && window.getComputedStyle(parent).position !== 'relative' && window.getComputedStyle(parent).position !== 'absolute') {
                parent.style.position = 'relative';
            }

            iframe.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
        });
    }

    // Deshabilitar arrastrar imágenes y canvas
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Deshabilitar selección de imágenes y canvas
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Bloquear atajos de teclado comunes para guardar/copiar
    document.addEventListener('keydown', function(e) {
        // Bloquear Ctrl+S (guardar)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Bloquear F12 (herramientas de desarrollo)
        if (e.key === 'F12') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Bloquear Ctrl+Shift+I (inspector)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Bloquear Ctrl+Shift+C (selector de elementos)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Bloquear Ctrl+U (ver código fuente)
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Deshabilitar copiar imágenes
    document.addEventListener('copy', function(e) {
        const selection = window.getSelection();
        if (selection && selection.toString().length === 0) {
            // Probablemente intenta copiar una imagen
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Agregar protección cuando las imágenes se cargan
    function protegerImagenes() {
        const imagenes = document.querySelectorAll('img');
        imagenes.forEach(function(img) {
            // Prevenir arrastre
            img.setAttribute('draggable', 'false');

            // Agregar eventos específicos
            img.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });

            img.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
            });

            img.addEventListener('mousedown', function(e) {
                // Prevenir arrastrar con clic y arrastre
                if (e.button === 0 || e.button === 2) {
                    e.preventDefault();
                }
            });
        });
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            protegerImagenes();
            protegerIframes();
        });
    } else {
        protegerImagenes();
        protegerIframes();
    }

    // Observar cambios en el DOM para proteger imágenes y canvas nuevos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG') {
                        const img = node;
                        img.setAttribute('draggable', 'false');
                        img.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            return false;
                        });
                        img.addEventListener('dragstart', function(e) {
                            e.preventDefault();
                            return false;
                        });
                    } else if (node.tagName === 'CANVAS') {
                        const canvas = node;
                        canvas.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            return false;
                        });
                        canvas.addEventListener('dragstart', function(e) {
                            e.preventDefault();
                            return false;
                        });
                        canvas.style.userSelect = 'none';
                    } else if (node.querySelector) {
                        const imgs = node.querySelectorAll('img');
                        imgs.forEach(function(img) {
                            img.setAttribute('draggable', 'false');
                            img.addEventListener('contextmenu', function(e) {
                                e.preventDefault();
                                return false;
                            });
                            img.addEventListener('dragstart', function(e) {
                                e.preventDefault();
                                return false;
                            });
                        });
                        const canvases = node.querySelectorAll('canvas');
                        canvases.forEach(function(canvas) {
                            canvas.addEventListener('contextmenu', function(e) {
                                e.preventDefault();
                                return false;
                            });
                            canvas.addEventListener('dragstart', function(e) {
                                e.preventDefault();
                                return false;
                            });
                            canvas.style.userSelect = 'none';
                        });
                    }
                }
            });
        });
    });

    // Iniciar observación
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // ========================================
    // DETECCIÓN DE DEVTOOLS
    // ========================================
    let devtoolsOpen = false;

    // Método 1: Detectar mediante tamaño de ventana
    function detectDevToolsBySize() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        return widthThreshold || heightThreshold;
    }

    // Método 2: Detectar mediante performance de console
    function detectDevToolsByConsole() {
        let isOpen = false;
        const start = performance.now();

        // El console.log es mucho más lento cuando DevTools está abierto
        console.profile('devtools-detect');
        console.profileEnd('devtools-detect');

        const end = performance.now();
        if (end - start > 100) {
            isOpen = true;
        }

        return isOpen;
    }

    // Función de advertencia cuando se detecta DevTools
    function onDevToolsDetected() {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            // console.clear(); // Comentado temporalmente para debug
            console.log('%c⚠️ ADVERTENCIA', 'font-size: 30px; color: red; font-weight: bold;');
            console.log('%cEste sitio está protegido.', 'font-size: 18px; color: orange;');
            console.log('%cLas fotos tienen marca de agua.', 'font-size: 14px;');
            console.log('%c💒 Francisco & Rossy', 'font-size: 16px; color: #8b6f47; font-weight: bold;');
        }
    }

    // Verificar cada 1 segundo
    setInterval(function() {
        if (detectDevToolsBySize()) {
            onDevToolsDetected();
        }
    }, 1000);

    // Protección adicional: Bloquear toDataURL en canvas para dificultar extracción
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
        // Permitir la funcionalidad pero registrar el intento
        console.warn('Intento de extraer datos del canvas detectado');
        return originalToDataURL.apply(this, arguments);
    };

    // Protección: Bloquear getImageData
    const CanvasRenderingContext2D_getImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function() {
        console.warn('Intento de extraer pixels del canvas detectado');
        return CanvasRenderingContext2D_getImageData.apply(this, arguments);
    };

    console.log('Protección de imágenes activada (Canvas + DevTools Detection)');
})();
