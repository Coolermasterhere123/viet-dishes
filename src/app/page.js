'use client';
import { useState, useEffect } from 'react';
import dishes from '@/data/dishes';
import DishCard from '@/components/DishCard';
import styles from './page.module.css';

const CITIES = [
  'Ho Chi Minh City',
  'Hoi An',
  'Da Nang',
  'Ninh Binh',
  'Hanoi',
  'Other',
];

export default function Home() {
  const [state, setState] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('viet-dishes-state');
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  function save(next) {
    setState(next);
    try { localStorage.setItem('viet-dishes-state', JSON.stringify(next)); } catch {}
  }

  function toggleCheck(id) {
    const next = { ...state, [id]: { ...state[id], checked: !state[id]?.checked } };
    save(next);
  }

  function setCity(id, city) {
    const next = { ...state, [id]: { ...state[id], city } };
    save(next);
  }

  const visible = dishes.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.eng.toLowerCase().includes(q) || d.viet.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'tried' ? !!state[d.id]?.checked :
      filter === 'untried' ? !state[d.id]?.checked : true;
    return matchSearch && matchFilter;
  });

  const tried = dishes.filter(d => state[d.id]?.checked).length;
  const pct = Math.round((tried / dishes.length) * 100);

  if (!mounted) return null;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>🍜 Vietnamese Dish Bucket List</h1>
        <p className={styles.sub}>Check off dishes as you try them and log where you ate them</p>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{tried}</span>
            <span className={styles.statLbl}>tried</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{dishes.length - tried}</span>
            <span className={styles.statLbl}>to go</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{pct}%</span>
            <span className={styles.statLbl}>done</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>

        <input
          className={styles.search}
          placeholder="Search dishes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className={styles.filters}>
          {['all', 'tried', 'untried'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'tried' ? '✅ Tried' : '⬜ To Try'}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.grid}>
        {visible.map(dish => (
          <DishCard
            key={dish.id}
            dish={dish}
            checked={!!state[dish.id]?.checked}
            city={state[dish.id]?.city || ''}
            cities={CITIES}
            onCheck={() => toggleCheck(dish.id)}
            onCity={city => setCity(dish.id, city)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className={styles.empty}>No dishes match your search.</p>
      )}
    </main>
  );
}
