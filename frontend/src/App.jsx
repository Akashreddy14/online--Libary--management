import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogIn, LogOut, UserRound, LibraryBig, ShieldCheck, History } from 'lucide-react';
import api from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('libraryUser') || 'null'); } catch { return null; }
  });
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const loadBooks = async () => {
    try {
      const { data } = await api.get('/books', { params: { search, category } });
      setBooks(data);
    } catch (error) { setNotice(error.response?.data?.message || 'Could not load books. Is the backend running?'); }
  };
  useEffect(() => { loadBooks(); }, [search, category]);

  const saveSession = (data) => {
    localStorage.setItem('libraryToken', data.token);
    localStorage.setItem('libraryUser', JSON.stringify(data.user));
    setUser(data.user);
    navigate('/');
  };
  const logout = () => {
    localStorage.removeItem('libraryToken'); localStorage.removeItem('libraryUser');
    setUser(null); navigate('/');
  };
  const message = (text) => { setNotice(text); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const borrow = async (id) => {
    if (!user) return navigate('/login');
    try { await api.post(`/loans/${id}/borrow`); message('Book borrowed successfully. Your due date is in 14 days.'); loadBooks(); }
    catch (error) { message(error.response?.data?.message || 'Unable to borrow book'); }
  };
  const reserve = async (id) => {
    if (!user) return navigate('/login');
    try { await api.post(`/reservations/${id}`); message('Reservation created successfully.'); }
    catch (error) { message(error.response?.data?.message || 'Unable to reserve book'); }
  };

  return <div className="app-shell">
    <header className="topbar">
      <Link to="/" className="brand"><span className="brand-icon"><BookOpen size={23}/></span><span>Page<span className="brand-accent">Nest</span><small>ONLINE LIBRARY</small></span></Link>
      <nav>
        <NavLink to="/">Browse Books</NavLink>
        {user && <NavLink to="/history">My Borrowings</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        {user ? <><span className="welcome"><UserRound size={16}/> {user.name}</span><button className="btn btn-outline btn-small" onClick={logout}><LogOut size={15}/> Logout</button></> :
          <><Link className="login-link" to="/login"><LogIn size={16}/> Login</Link><Link className="btn btn-primary btn-small" to="/register">Join library</Link></>}
      </div>
    </header>
    <main className="container">
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div>}
      <Routes>
        <Route path="/" element={<>
          <section className="hero">
            <div className="hero-copy"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Find your next<br/><em>great read.</em></h1><p>Explore a world of knowledge. Search our collection, borrow your favourites, and keep your reading journey moving.</p><a href="#catalog" className="btn btn-light">Explore collection <span>→</span></a></div>
            <div className="hero-art"><div className="sun"></div><div className="book-stack"><div className="book book-one">THE ART<br/>OF READING</div><div className="book book-two">Ideas &<br/>Stories</div><div className="book book-three">KNOW<br/>MORE</div></div><div className="hero-note">A little reading<br/>goes a long way.</div></div>
          </section>
          <section id="catalog" className="catalog-section">
            <div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Discover books</h2><p>Find a story, learn something new, or revisit a classic.</p></div><span className="book-count"><LibraryBig size={17}/> {books.length} books</span></div>
            <div className="filters"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..."/></div><select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(books.map(b => b.category).filter(Boolean))].map(c => <option key={c}>{c}</option>)}</select></div>
            {books.length ? <div className="book-grid">{books.map(book => <article className="book-card" key={book._id}><div className="cover" style={{ background: coverColor(book.category) }}>{book.image ? <img src={book.image} alt={book.title}/> : <><span className="cover-label">{book.category || 'LIBRARY EDITION'}</span><BookOpen size={42}/><strong>{book.title}</strong><small>{book.author}</small></>}</div><div className="book-info"><span className="category-tag">{book.category || 'General'}</span><h3>{book.title}</h3><p>by {book.author}</p><div className="card-bottom"><span className={book.availableCopies > 0 ? 'available' : 'unavailable'}>{book.availableCopies > 0 ? `${book.availableCopies} available` : 'Currently unavailable'}</span><div className="card-buttons"><button className="btn btn-primary btn-small" disabled={book.availableCopies < 1} onClick={() => borrow(book._id)}>Borrow</button><button className="btn btn-outline btn-small" onClick={() => reserve(book._id)}>Reserve</button></div></div></div></article>)}</div> : <div className="empty-state"><BookOpen size={36}/><h3>No books found</h3><p>Try another search, or ask an administrator to add books.</p></div>}
          </section>
        </>}/>
        <Route path="/login" element={<AuthForm mode="login" onSuccess={saveSession}/>}/>
        <Route path="/register" element={<AuthForm mode="register" onSuccess={saveSession}/>}/>
        <Route path="/history" element={<Protected user={user}><HistoryPage message={message}/></Protected>}/>
        <Route path="/admin" element={<Protected user={user} admin><AdminPage message={message}/></Protected>}/>
        <Route path="*" element={<div className="empty-state"><h2>Page not found</h2><Link to="/" className="btn btn-primary">Go home</Link></div>}/>
      </Routes>
    </main>
    <footer><div className="footer-brand"><BookOpen size={19}/> PageNest</div><p>Making knowledge accessible, one book at a time.</p><small>© {new Date().getFullYear()} PageNest Library Management System</small></footer>
  </div>;
}

function coverColor(category = '') {
  const colors = ['#d9b99b', '#a9b8a2', '#c8b3c9', '#d4c28f', '#9fb9c2'];
  return colors[[...category].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
}

function AuthForm({ mode, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.post(`/auth/${mode}`, form); onSuccess(data); }
    catch (err) { setError(err.response?.data?.message || 'Request failed. Check the server connection.'); }
    finally { setBusy(false); }
  };
  return <section className="auth-wrap"><div className="auth-card"><div className="auth-icon"><BookOpen size={25}/></div><span className="eyebrow">{register ? 'BECOME A MEMBER' : 'WELCOME BACK'}</span><h2>{register ? 'Create your account' : 'Sign in to PageNest'}</h2><p>{register ? 'Join our reading community today.' : 'Your next chapter is waiting.'}</p><form onSubmit={submit}>{register && <label>Full name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="At least 6 characters"/></label>{error && <div className="form-error">{error}</div>}<button className="btn btn-primary submit-btn" disabled={busy}>{busy ? 'Please wait...' : register ? 'Create account' : 'Login'}</button></form><p className="switch-auth">{register ? 'Already a member?' : 'New to PageNest?'} <Link to={register ? '/login' : '/register'}>{register ? 'Login' : 'Create an account'}</Link></p></div></section>;
}

function Protected({ user, admin = false, children }) {
  if (!user) return <div className="empty-state"><UserRound size={36}/><h2>Please log in</h2><p>You need an account to access this page.</p><Link to="/login" className="btn btn-primary">Login</Link></div>;
  if (admin && user.role !== 'admin') return <div className="empty-state"><ShieldCheck size={36}/><h2>Admin access only</h2><Link to="/" className="btn btn-primary">Back to books</Link></div>;
  return children;
}

function HistoryPage({ message }) {
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const refresh = async () => {
    try { const [a,b] = await Promise.all([api.get('/loans/mine'), api.get('/reservations/mine')]); setLoans(a.data); setReservations(b.data); }
    catch { message('Could not load your borrowing history.'); }
  };
  useEffect(() => { refresh(); }, []);
  const returnBook = async (id) => { try { await api.patch(`/loans/${id}/return`); message('Book returned.'); refresh(); } catch(e) { message(e.response?.data?.message || 'Return failed'); } };
  const cancel = async (id) => { try { await api.patch(`/reservations/${id}/cancel`); message('Reservation cancelled.'); refresh(); } catch(e) { message(e.response?.data?.message || 'Cancel failed'); } };
  return <section className="dashboard-page"><span className="eyebrow">YOUR READING ACCOUNT</span><h2>My activity</h2><div className="panel"><h3><History size={18}/> Borrowing history</h3>{loans.length ? loans.map(l => <div className="record" key={l._id}><div><strong>{l.book?.title || 'Deleted book'}</strong><small>Due {new Date(l.dueAt).toLocaleDateString()} · {l.status}</small></div>{l.status === 'borrowed' && <button className="btn btn-outline btn-small" onClick={() => returnBook(l._id)}>Return book</button>}</div>) : <p className="muted">You have no borrowing records yet.</p>}</div><div className="panel"><h3>Reservations</h3>{reservations.length ? reservations.map(r => <div className="record" key={r._id}><div><strong>{r.book?.title || 'Deleted book'}</strong><small>{r.status}</small></div>{r.status === 'pending' && <button className="btn btn-outline btn-small" onClick={() => cancel(r._id)}>Cancel</button>}</div>) : <p className="muted">No reservations yet.</p>}</div></section>;
}

function AdminPage({ message }) {
  const blank = { title:'', author:'', category:'General', isbn:'', description:'', totalCopies:1 };
  const [form, setForm] = useState(blank);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null);
  const load = async () => { try { const [b,s] = await Promise.all([api.get('/books'), api.get('/reports/summary')]); setBooks(b.data); setStats(s.data); } catch { message('Could not load admin information.'); } };
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/books/${editing}`, form);
      else await api.post('/books', form);
      setForm(blank); setEditing(null); message(editing ? 'Book updated.' : 'Book added.'); load();
    } catch (err) { message(err.response?.data?.message || 'Could not save book'); }
  };
  const edit = (b) => { setEditing(b._id); setForm({ title:b.title, author:b.author, category:b.category, isbn:b.isbn, description:b.description, totalCopies:b.totalCopies }); window.scrollTo({top:0, behavior:'smooth'}); };
  const remove = async (id) => { if (!confirm('Delete this book?')) return; try { await api.delete(`/books/${id}`); message('Book deleted.'); load(); } catch(e) { message(e.response?.data?.message || 'Delete failed'); } };
  return <section className="dashboard-page"><span className="eyebrow">LIBRARY CONTROL CENTRE</span><h2>Admin dashboard</h2>{stats && <div className="stats-grid">{[['Total books',stats.books],['Members',stats.users],['Active loans',stats.activeLoans],['Overdue',stats.overdueLoans]].map(([label,value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}<div className="panel"><h3>{editing ? 'Update book' : 'Add a new book'}</h3><form className="book-form" onSubmit={submit}><input required placeholder="Book title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input required placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input placeholder="ISBN" value={form.isbn} onChange={e=>setForm({...form,isbn:e.target.value})}/><input type="number" min="0" placeholder="Total copies" value={form.totalCopies} onChange={e=>setForm({...form,totalCopies:Number(e.target.value)})}/><input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><div className="form-actions"><button className="btn btn-primary">{editing ? 'Save changes' : 'Add book'}</button>{editing && <button type="button" className="btn btn-outline" onClick={()=>{setEditing(null);setForm(blank)}}>Cancel edit</button>}</div></form></div><div className="panel"><h3>Manage catalogue</h3>{books.map(b=><div className="record" key={b._id}><div><strong>{b.title}</strong><small>{b.author} · {b.availableCopies}/{b.totalCopies} available</small></div><div className="record-actions"><button className="btn btn-outline btn-small" onClick={()=>edit(b)}>Edit</button><button className="btn btn-danger btn-small" onClick={()=>remove(b._id)}>Delete</button></div></div>)}</div></section>;
}

export default App;
