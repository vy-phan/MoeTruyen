import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Import các trang
import HomePage from './pages/HomePage';
import MangaDetailPage from './pages/MangaDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 flex flex-col text-base-content font-sans antialiased">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/manga/:id" element={<MangaDetailPage />} />
            <Route path="/chapters/:id" element={<ChapterReaderPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/history" element={<HistoryPage />} />
            

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}