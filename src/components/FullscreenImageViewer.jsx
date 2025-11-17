import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../services/api';

/**
 * Reusable Fullscreen Image Viewer with Pinch-to-Zoom and Pan/Drag
 *
 * Features:
 * - Pinch-to-zoom gesture support (2-finger zoom)
 * - Pan/drag when zoomed in
 * - Gallery navigation (prev/next)
 * - Image counter
 * - Reset zoom button
 * - Touch-optimized for POS touchscreens
 *
 * @param {Object} props
 * @param {string|string[]} props.images - Single image URL or array of URLs
 * @param {number} props.currentIndex - Active image index (for galleries)
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onNavigate - Navigation handler (index) => void
 */
export default function FullscreenImageViewer({
  images,
  currentIndex = 0,
  onClose,
  onNavigate
}) {
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Touch gesture tracking
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [lastTouchCenter, setLastTouchCenter] = useState(null);
  const [panStartPosition, setPanStartPosition] = useState(null);

  // Image error handling
  const [imageError, setImageError] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Validate and normalize images (after hooks to comply with Rules of Hooks)
  if (!images) {
    console.warn('⚠️ FullscreenImageViewer: No images provided');
    return null;
  }

  // Normalize images to array and filter out null/undefined values
  const imageArray = (Array.isArray(images) ? images : [images]).filter(Boolean);

  // Return null if no valid images after filtering
  if (imageArray.length === 0) {
    console.warn('⚠️ FullscreenImageViewer: No valid images found');
    return null;
  }

  const isGallery = imageArray.length > 1;

  // Constants
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;
  const ZOOM_STEP = 0.1;

  // Reset zoom and error state when changing images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageError(false);
  }, [currentIndex]);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Constrain position to prevent dragging image out of bounds
  const constrainPosition = (pos, currentScale) => {
    if (!imageRef.current || !containerRef.current) return pos;

    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate max allowed offset
    const maxOffsetX = Math.max(0, (imageRect.width * currentScale - containerRect.width) / 2);
    const maxOffsetY = Math.max(0, (imageRect.height * currentScale - containerRect.height) / 2);

    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, pos.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, pos.y))
    };
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
      setIsPanning(false);
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan start (only when zoomed)
      setIsPanning(true);
      setPanStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch-to-zoom in progress
      e.preventDefault();

      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);

      // Calculate scale change
      const scaleChange = distance / lastTouchDistance;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleChange));

      // Calculate position adjustment to zoom towards touch center
      if (lastTouchCenter && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = center.x - containerRect.left - containerRect.width / 2;
        const centerY = center.y - containerRect.top - containerRect.height / 2;

        const scaleDiff = newScale / scale;
        const newPosition = {
          x: position.x - centerX * (scaleDiff - 1),
          y: position.y - centerY * (scaleDiff - 1)
        };

        setPosition(constrainPosition(newPosition, newScale));
      }

      setScale(newScale);
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    } else if (e.touches.length === 1 && isPanning && panStartPosition && scale > 1) {
      // Pan in progress
      e.preventDefault();

      const newPosition = {
        x: e.touches[0].clientX - panStartPosition.x,
        y: e.touches[0].clientY - panStartPosition.y
      };

      setPosition(constrainPosition(newPosition, scale));
    }
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
      setLastTouchCenter(null);
    }
    if (e.touches.length === 0) {
      setIsPanning(false);
      setPanStartPosition(null);
    }
  };

  // ===== MOUSE EVENT HANDLERS (for desktop testing) =====

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();

    // Determine zoom direction (wheel up = zoom in, wheel down = zoom out)
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

    // Zoom towards mouse cursor position
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = e.clientX - containerRect.left - containerRect.width / 2;
      const centerY = e.clientY - containerRect.top - containerRect.height / 2;

      const scaleDiff = newScale / scale;
      const newPosition = {
        x: position.x - centerX * (scaleDiff - 1),
        y: position.y - centerY * (scaleDiff - 1)
      };

      setPosition(constrainPosition(newPosition, newScale));
    }

    setScale(newScale);
  };

  // Handle mouse drag start
  const handleMouseDown = (e) => {
    if (scale > 1 && e.button === 0) { // Only left mouse button
      e.preventDefault();
      setIsPanning(true);
      setPanStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle mouse drag move
  const handleMouseMove = (e) => {
    if (isPanning && panStartPosition && scale > 1) {
      e.preventDefault();

      const newPosition = {
        x: e.clientX - panStartPosition.x,
        y: e.clientY - panStartPosition.y
      };

      setPosition(constrainPosition(newPosition, scale));
    }
  };

  // Handle mouse drag end
  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStartPosition(null);
  };

  // Reset zoom
  const handleResetZoom = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Navigate to previous image
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!isGallery || !onNavigate) return;
    const newIndex = currentIndex === 0 ? imageArray.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  // Navigate to next image
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!isGallery || !onNavigate) return;
    const newIndex = currentIndex === imageArray.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  // Close handler
  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  // Handle background click (close only if not zoomed or not panning)
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget && scale === 1 && !isPanning) {
      onClose();
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    console.error('❌ Failed to load image:', imageArray[currentIndex]);
    setImageError(true);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 text-white text-4xl font-bold
          active:scale-90 transition-transform z-20"
      >
        ✕
      </button>

      {/* Image Counter (Gallery only) */}
      {isGallery && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2
          bg-black/50 text-white px-6 py-3 rounded-xl text-lg z-20">
          {currentIndex + 1} / {imageArray.length}
        </div>
      )}

      {/* Previous Button (Gallery only) */}
      {isGallery && (
        <button
          onClick={handlePrevImage}
          className="absolute left-8 text-white text-6xl font-bold
            active:scale-90 transition-transform z-20"
        >
          ‹
        </button>
      )}

      {/* Next Button (Gallery only) */}
      {isGallery && (
        <button
          onClick={handleNextImage}
          className="absolute right-8 text-white text-6xl font-bold
            active:scale-90 transition-transform z-20"
        >
          ›
        </button>
      )}

      {/* Reset Zoom Button (visible only when zoomed) */}
      {scale > 1 && (
        <button
          onClick={handleResetZoom}
          className="absolute bottom-8 right-8 bg-white/20 text-white px-6 py-3
            rounded-xl text-lg font-semibold active:bg-white/30 transition-colors z-20"
        >
          Reset Zoom
        </button>
      )}

      {/* Main Image */}
      {!imageError ? (
        <img
          ref={imageRef}
          src={getImageUrl(imageArray[currentIndex])}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-[90%] max-h-[90%] object-contain select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center',
            transition: isPanning || lastTouchDistance ? 'none' : 'transform 0.1s ease-out',
            touchAction: 'none', // Prevent default browser gestures
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
          onError={handleImageError}
          draggable={false}
        />
      ) : (
        /* Fallback placeholder when image fails to load */
        <div
          className="flex flex-col items-center justify-center text-white text-center p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">📷</div>
          <div className="text-2xl font-semibold mb-2">Failed to Load Image</div>
          <div className="text-lg text-gray-400">The image could not be displayed</div>
        </div>
      )}
    </div>
  );
}
