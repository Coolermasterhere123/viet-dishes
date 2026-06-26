'use client';
import { useState, useRef, useCallback } from 'react';
import styles from './DishCard.module.css';

const LONG_PRESS_MS = 600;
const MOVE_THRESHOLD = 10; // px of movement cancels the press

export default function DishCard({ dish, checked, city, cities, onCheck, onCity }) {
  const [imgErr, setImgErr] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pressTimer = useRef(null);
  const didLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const cancelPress = useCallback(() => {
    clearTimeout(pressTimer.current);
  }, []);

  const handleTouchStart = useCallback((e) => {
    didLongPress.current = false;
    const t = e.touches[0];
    startPos.current = { x: t.clientX, y: t.clientY };
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onCheck();
      if (navigator.vibrate) navigator.vibrate(40);
    }, LONG_PRESS_MS);
  }, [onCheck]);

  const handleTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startPos.current.x);
    const dy = Math.abs(t.clientY - startPos.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clearTimeout(pressTimer.current); // scrolling — cancel
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    clearTimeout(pressTimer.current);
    if (!didLongPress.current) {
      // Only open modal if finger barely moved (not a scroll)
      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - startPos.current.x);
      const dy = Math.abs(t.clientY - startPos.current.y);
      if (dx < MOVE_THRESHOLD && dy < MOVE_THRESHOLD) {
        setShowModal(true);
      }
    }
  }, []);

  // Mouse support for desktop
  const handleMouseDown = useCallback((e) => {
    didLongPress.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onCheck();
    }, LONG_PRESS_MS);
  }, [onCheck]);

  const handleMouseUp = useCallback((e) => {
    clearTimeout(pressTimer.current);
    if (!didLongPress.current) {
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx < MOVE_THRESHOLD && dy < MOVE_THRESHOLD) {
        setShowModal(true);
      }
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.card} ${checked ? styles.checked : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={cancelPress}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={cancelPress}
        onContextMenu={e => e.preventDefault()}
      >
        <div className={styles.imgWrap}>
          {!imgErr ? (
            <img
              src={dish.img}
              alt={dish.eng}
              className={styles.img}
              onError={() => setImgErr(true)}
              draggable={false}
            />
          ) : (
            <div className={styles.imgFallback}>🍜</div>
          )}
          {checked && (
            <div className={styles.checkOverlay}>
              <span className={styles.checkMark}>✓</span>
            </div>
          )}
          <div className={styles.hint}>
            <span>tap = info</span>
            <span>hold = ✓</span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.names}>
            <p className={`${styles.eng} ${checked ? styles.done : ''}`}>{dish.eng}</p>
            <p className={styles.viet}>{dish.viet}</p>
          </div>
          <select
            className={`${styles.citySelect} ${city ? styles.citySet : ''}`}
            value={city}
            onChange={e => { e.stopPropagation(); onCity(e.target.value); }}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => { e.stopPropagation(); cancelPress(); }}
          >
            <option value="">📍 Where?</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {showModal && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={() => setShowModal(false)}
          onTouchEnd={() => setShowModal(false)}
        >
          <div
            className={styles.modal}
            onMouseDown={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <div className={styles.modalImg}>
              {!imgErr ? (
                <img src={dish.img} alt={dish.eng} onError={() => setImgErr(true)} />
              ) : (
                <div className={styles.modalImgFallback}>🍜</div>
              )}
              {checked && <div className={styles.modalBadge}>✓ Tried</div>}
            </div>

            <div className={styles.modalBody}>
              <h2 className={styles.modalEng}>{dish.eng}</h2>
              <p className={styles.modalViet}>{dish.viet}</p>
              <p className={styles.modalDesc}>{dish.desc}</p>

              <div className={styles.infoSection}>
                <div className={styles.infoLabel}>🥬 Ingredients</div>
                <div className={styles.infoText}>{dish.ingredients}</div>
              </div>
              <div className={styles.infoSection}>
                <div className={styles.infoLabel}>👨‍🍳 Preparation</div>
                <div className={styles.infoText}>{dish.prep}</div>
              </div>
              <div className={styles.infoSection}>
                <div className={styles.infoLabel}>📍 Where to find it</div>
                <div className={styles.infoText}>{dish.location}</div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={`${styles.triedBtn} ${checked ? styles.triedBtnOn : ''}`}
                  onClick={() => { onCheck(); setShowModal(false); }}
                >
                  {checked ? '✓ Marked as tried' : 'Mark as tried'}
                </button>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
