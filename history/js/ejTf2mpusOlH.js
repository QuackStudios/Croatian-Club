document.addEventListener('DOMContentLoaded', () => {
    const targetSelector = fintonaMapConfig.targetSelector;
    const mapHtml = fintonaMapConfig.mapHtml;

    // force the map layering on older browsers
    const mapElement = document.getElementById('fintona-map');
    if (mapElement) {
        if (mapElement.closest('section.wysiwyg')) {
            mapElement.closest('section.wysiwyg').classList.add('has-fintona-map');
        } else {
            mapElement.classList.add('has-fintona-map');
        }
    }

    const targetSection = document.querySelector(targetSelector);
    if (targetSection) {
        targetSection.innerHTML = mapHtml;
    } else {
        console.warn('Target section not found. Map not inserted.');
        return;
    }

    const mapContainer = document.getElementById('map-container');
    const mapWrapper = document.querySelector('.map-container-wrapper');
    const layerWrappers = document.querySelectorAll('.map-layer-wrapper');
    const zoomInButton = document.querySelector('.zoom-in');
    const zoomOutButton = document.querySelector('.zoom-out');
    const controls = document.querySelector('.controls');
    const toggleButton = document.querySelector('.menu-toggle');

    let scale = 1; // Current scale
    const maxScale = 3; // Maximum scale
    let translateX = 0; // Horizontal pan offset
    let translateY = 0; // Vertical pan offset
    let isPanning = false;
    let startX = 0;
    let startY = 0;


    function initializeWrappers() {
        let imagesLoaded = 0;

        layerWrappers.forEach(wrapper => {
            const img = wrapper.querySelector('img');

            img.onload = () => {
                imagesLoaded++;

                if (!wrapper.classList.contains('base')) {
                    wrapper.style.display = 'block';
                }

                // Once all images are loaded, apply initial transformations
                if (imagesLoaded === layerWrappers.length) {
                    // scale = minScale;
                    initializeMap();
                }
            }

            // Handle cached images (when images are already in the browser's cache)
            if (img.complete) {
                img.onload();
            }
        });

        translateX = -mapContainer.style.width.substring(0, mapContainer.style.width.length - 2) / 2;
        translateY = -mapContainer.style.height.substring(0, mapContainer.style.height.length - 2) / 2.25;

        scale = Math.min(scale + 0.2, maxScale);
        applyTransform();
    }

    // Initialize map container dimensions and transformations
    function initializeMap() {
        const wrapperRect = mapWrapper.getBoundingClientRect();
        const baseLayer = document.querySelector('.map-layer.base');

        // Set the `map-container` dimensions based on the wrapper's width while maintaining aspect ratio
        const aspectRatio = baseLayer.naturalHeight / baseLayer.naturalWidth;
        mapContainer.style.width = `${wrapperRect.width}px`;
        mapContainer.style.height = `${wrapperRect.width * aspectRatio}px`;

        // Check if the wrapper is larger than the map-container
        const containerRect = mapContainer.getBoundingClientRect();
        if (wrapperRect.height > containerRect.height) {
            // Adjust wrapper height to fit the map-container
            mapWrapper.style.height = `${containerRect.height}px`;
        }
        if (wrapperRect.width > containerRect.width) {
            // Adjust wrapper width to fit the map-container
            mapWrapper.style.width = `${containerRect.width}px`;
        }

        // Set `scale` to ensure the map fits the wrapper initially
        scale = 1;
        
        // Calculate initial translation to center the map-container
        translateX = 0;
        translateY = 0;

        // Apply transformations
        applyTransform();
    }

    // Enforce panning boundaries
    function enforceBounds() {
        const wrapperRect = mapWrapper.getBoundingClientRect();
        const containerRect = mapContainer.getBoundingClientRect();
    
        // Calculate excess height and width between container and wrapper
        const excessHeight = containerRect.height - wrapperRect.height;
        const excessWidth = containerRect.width - wrapperRect.width;
    
        // Max allowable translations
        const maxTranslateX = Math.max(0, excessWidth);
        const maxTranslateY = Math.max(0, excessHeight);
    
        // Clamp translations to stay within bounds
        translateX = Math.max(-maxTranslateX, Math.min(0, translateX));
        translateY = Math.max(-maxTranslateY, Math.min(0, translateY));
    }

    // Apply transformations to `map-container`
    function applyTransform() {
        enforceBounds();
        const wrapperRect = mapWrapper.getBoundingClientRect();
        const baseLayer = document.querySelector('.map-layer.base');

        // Set the `map-container` dimensions based on the wrapper's width while maintaining aspect ratio
        const aspectRatio = baseLayer.naturalHeight / baseLayer.naturalWidth;

        mapContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        mapContainer.style.width = `${wrapperRect.width}px`;
        mapContainer.style.height = `${wrapperRect.width * aspectRatio}px`;
    }

    // Zoom In
    zoomInButton.addEventListener('click', () => {
        if (scale < maxScale) {
            scale = Math.min(scale + 0.2, maxScale);
            applyTransform();
        }
    });

    // Zoom Out
    zoomOutButton.addEventListener('click', () => {
        if (scale > 1) {
            scale = Math.max(scale - 0.2, 1);
            applyTransform();
            enforceBounds();            
            applyTransform();
        }
    });

    // Pan with mouse
    mapContainer.addEventListener('mousedown', (event) => {
        event.preventDefault(); // Prevent default text selection behavior
        isPanning = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
    });

    mapContainer.addEventListener('mousemove', (event) => {
        if (!isPanning) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        applyTransform();
    });

    mapContainer.addEventListener('mouseup', () => (isPanning = false));
    mapContainer.addEventListener('mouseleave', () => (isPanning = false));

    // Handle touch events for mobile
    mapContainer.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            event.preventDefault(); // Prevent text selection
            isPanning = true;
            startX = event.touches[0].clientX - translateX;
            startY = event.touches[0].clientY - translateY;
        }
    });

    mapContainer.addEventListener('touchmove', (event) => {
        if (isPanning && event.touches.length === 1) {
            event.preventDefault(); // Prevent window scrolling
            translateX = event.touches[0].clientX - startX;
            translateY = event.touches[0].clientY - startY;
            applyTransform();
        }
    });

    mapContainer.addEventListener('touchend', () => (isPanning = false));

    // Toggle controls visibility
    toggleButton.addEventListener('click', () => {
        controls.classList.toggle('open');
        controls.classList.toggle('closed');
        toggleButton.classList.toggle('active'); // Add or remove the 'active' class
    });

    // Layer toggling
    document.querySelectorAll('button[data-toggle]').forEach((button) => {
        button.addEventListener('click', (event) => {
            const layer = event.target.getAttribute('data-toggle');
            const wrapper = document.querySelector(`.map-layer-wrapper[data-layer="${layer}"]`);
            if (wrapper) {
                wrapper.style.display = wrapper.style.display === 'block' ? 'none' : 'block';
                button.classList.toggle('active');
            }
        });
    });

    // Recalculate map dimensions on window resize
    window.addEventListener('resize', () => {
        initializeMap();
    });

    const baseLayer = document.querySelector('.map-layer.base');
    // Initialize map on DOMContentLoaded
    if (baseLayer.complete) {
        initializeWrappers();
    } else {
        baseLayer.onload = initializeWrappers;
    }

    document.addEventListener('dragstart', (event) => {
        event.preventDefault(); // Disable drag-and-drop of map elements
    });
});