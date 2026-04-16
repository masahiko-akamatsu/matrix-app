import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const QUADRANTS = ['a', 'b', 'c', 'd', 'e'];
const empty = () => Object.fromEntries(QUADRANTS.map(q => [q, []]));

export function useTasks(uid) {
  const [tasks, setTasks] = useState(empty());
  const [synced, setSynced] = useState(false);
  const saveRef = useRef(null);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'data', 'tasks');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const loaded = empty();
        QUADRANTS.forEach(q => { if (Array.isArray(data[q])) loaded[q] = data[q]; });
        setTasks(loaded);
      }
      setSynced(true);
    });
    return unsub;
  }, [uid]);

  const save = (newTasks) => {
    if (!uid) return;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      setDoc(doc(db, 'users', uid, 'data', 'tasks'), newTasks, { merge: true });
    }, 600);
  };

  const addTask = (q, text) => {
    const newTasks = { ...tasks, [q]: [...tasks[q], { id: Date.now(), text, done: false }] };
    setTasks(newTasks);
    save(newTasks);
  };

  const toggleTask = (q, id) => {
    const newTasks = { ...tasks, [q]: tasks[q].map(t => t.id === id ? { ...t, done: !t.done } : t) };
    setTasks(newTasks);
    save(newTasks);
  };

  const deleteTask = (q, id) => {
    const newTasks = { ...tasks, [q]: tasks[q].filter(t => t.id !== id) };
    setTasks(newTasks);
    save(newTasks);
  };

  const getStats = (q) => {
    const total = tasks[q].length;
    const done = tasks[q].filter(t => t.done).length;
    return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 };
  };

  const getTotalStats = () => {
    let total = 0, done = 0;
    QUADRANTS.forEach(q => { total += tasks[q].length; done += tasks[q].filter(t => t.done).length; });
    return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 };
  };

  return { tasks, synced, addTask, toggleTask, deleteTask, getStats, getTotalStats };
}
