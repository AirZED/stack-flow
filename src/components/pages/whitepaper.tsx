import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import {
  FiCopy,
  FiMenu,
  FiX,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

interface ToCItem {
  id: string;
  title: string;
  level: number;
}

interface SearchMatch {
  index: number;
  text: string;
  context: string;
}

const WhitepaperPage = () => {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<ToCItem[]>([]);
  const [filteredToC, setFilteredToC] = useState<ToCItem[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [highlightedMarkdown, setHighlightedMarkdown] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/WHITEPAPER.md")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        // Extract headings for table of contents
        const headings: ToCItem[] = [];
        const lines = text.split("\n");
        lines.forEach((line) => {
          const match = line.match(/^(#{1,3})\s+(.+)/);
          if (match) {
            const level = match[1].length;
            const title = match[2].replace(/[*_`]/g, "");
            const id = title
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-");
            headings.push({ id, title, level });
          }
        });
        setTableOfContents(headings);
        setFilteredToC(headings);
        setHighlightedMarkdown(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading whitepaper:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Full-text search through entire whitepaper
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredToC(tableOfContents);
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      setHighlightedMarkdown(markdown);
    } else {
      // Filter table of contents
      const filtered = tableOfContents.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredToC(filtered);

      // Search through entire markdown content
      const query = searchQuery.toLowerCase();
      const matches: SearchMatch[] = [];
      let searchIndex = 0;
      const lowerMarkdown = markdown.toLowerCase();

      while (searchIndex < markdown.length) {
        const index = lowerMarkdown.indexOf(query, searchIndex);
        if (index === -1) break;

        // Get context around the match (50 chars before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(markdown.length, index + query.length + 50);
        const context = markdown.substring(start, end);

        matches.push({
          index,
          text: markdown.substring(index, index + query.length),
          context:
            (start > 0 ? "..." : "") +
            context +
            (end < markdown.length ? "..." : ""),
        });

        searchIndex = index + query.length;
      }

      setSearchMatches(matches);
      setCurrentMatchIndex(0);

      // Highlight matches in markdown
      if (matches.length > 0) {
        let highlightedText = markdown;
        // Replace from end to start to maintain indices
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i];
          const before = highlightedText.substring(0, match.index);
          const matchText = highlightedText.substring(
            match.index,
            match.index + query.length
          );
          const after = highlightedText.substring(match.index + query.length);

          const highlightClass =
            i === 0 ? "search-highlight-current" : "search-highlight";
          highlightedText = `${before}<mark class="${highlightClass}">${matchText}</mark>${after}`;
        }
        setHighlightedMarkdown(highlightedText);
      } else {
        setHighlightedMarkdown(markdown);
      }
    }
  }, [searchQuery, markdown, tableOfContents]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(
        ".whitepaper-content h1, .whitepaper-content h2, .whitepaper-content h3"
      );
      let current = "";

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const scrollPosition = window.scrollY + 100;

        if (scrollPosition >= sectionTop) {
          current = section.id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [markdown]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setSidebarOpen(false);
    }
  };

  const scrollToMatch = (index: number) => {
    const marks = document.querySelectorAll(
      ".search-highlight, .search-highlight-current"
    );
    if (marks[index]) {
      // Remove current highlight from all
      marks.forEach((mark) => {
        mark.classList.remove("search-highlight-current");
        mark.classList.add("search-highlight");
      });

      // Add current highlight to selected
      marks[index].classList.remove("search-highlight");
      marks[index].classList.add("search-highlight-current");

      // Scroll to match
      marks[index].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const goToNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(nextIndex);
  };

  const goToPreviousMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex =
      currentMatchIndex === 0
        ? searchMatches.length - 1
        : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(prevIndex);
  };

  useEffect(() => {
    if (searchMatches.length > 0) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex, searchMatches.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d120c] flex items-center justify-center">
        <div className="text-white text-xl">Loading whitepaper...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d120c] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            Error loading whitepaper
          </div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="min-h-screen bg-[#0d120c] flex items-center justify-center">
        <div className="text-white text-xl">No whitepaper content found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d120c] text-white">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] transition-colors"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className="flex">
        {/* Left Sidebar - Table of Contents */}
        <aside
          className={`fixed top-0 left-0 h-screen w-72 bg-[#0a0a0a] border-r border-gray-800 transition-transform duration-300 z-40 pt-20 lg:pt-24 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#bbf838]">
              Table of Contents
            </h2>
          </div>

          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto p-6 space-y-1">
            {filteredToC.length > 0 ? (
              filteredToC.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                    item.level === 1
                      ? "font-semibold"
                      : item.level === 2
                      ? "pl-6 text-sm"
                      : "pl-9 text-xs"
                  } ${
                    activeSection === item.id
                      ? "bg-[#bbf838]/10 text-[#bbf838]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  {item.title}
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No sections match "{searchQuery}"
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-800 flex-shrink-0">
            <a
              href="/"
              className="block text-center py-2 px-4 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
            >
              ← Back to Home
            </a>
          </div>
        </aside>

        {/* Right Sidebar - Search */}
        <aside className="fixed top-0 right-0 h-screen w-80 bg-[#0a0a0a] border-l border-gray-800 z-40 pt-20 lg:pt-24 flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#bbf838] mb-4">Search</h2>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search whitepaper..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#bbf838] focus:ring-1 focus:ring-[#bbf838] transition-colors"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Search Results Info */}
            {searchQuery && searchMatches.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>
                    Match {currentMatchIndex + 1} of {searchMatches.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={goToPreviousMatch}
                      className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors"
                      title="Previous match (Shift+Enter)"
                    >
                      <FiChevronUp size={16} />
                    </button>
                    <button
                      onClick={goToNextMatch}
                      className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors"
                      title="Next match (Enter)"
                    >
                      <FiChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {searchQuery && searchMatches.length === 0 && (
              <div className="text-xs text-gray-400 mb-2">
                No matches found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchQuery && searchMatches.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">
                  Click on a result to jump to it:
                </p>
                {searchMatches.map((match, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentMatchIndex(index);
                      scrollToMatch(index);
                    }}
                    className={`block w-full text-left p-3 rounded-lg transition-colors text-sm ${
                      index === currentMatchIndex
                        ? "bg-[#bbf838]/10 border border-[#bbf838]/30"
                        : "bg-[#1a1a1a] hover:bg-[#252525] border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`flex-shrink-0 text-xs font-mono ${
                          index === currentMatchIndex
                            ? "text-[#bbf838]"
                            : "text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-gray-300 leading-relaxed">
                        {match.context}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center text-gray-500 py-8">
                <FiSearch size={48} className="mx-auto mb-4 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FiSearch size={48} className="mx-auto mb-4 opacity-20" />
                <p>Start typing to search through the entire whitepaper</p>
              </div>
            )}
          </div>

          {/* Search Tips Footer */}
          <div className="p-6 border-t border-gray-800 flex-shrink-0 text-xs text-gray-500">
            <p className="mb-2">💡 Tips:</p>
            <ul className="space-y-1">
              <li>• Search is case-insensitive</li>
              <li>• Use ↑↓ arrows to navigate</li>
              <li>• All matches are highlighted</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 lg:px-12 py-24 max-w-4xl mx-auto lg:mr-80">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <nav className="text-sm text-gray-400">
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
                <span className="mx-2">/</span>
                <span className="text-white">About</span>
              </nav>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors"
              >
                <FiCopy size={16} />
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#bbf838] to-[#8bc34a] bg-clip-text text-transparent">
              About StackFlow
            </h1>
            <p className="text-gray-400 mt-4">
              Bitcoin-Secured DeFi and Sentiment Trading Platform
            </p>
          </div>

          {/* Whitepaper Content */}
          <div
            ref={contentRef}
            className="whitepaper-content prose prose-invert prose-lg max-w-none"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
              ]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-4xl font-bold mt-12 mb-6 pb-4 border-b border-gray-800 text-white"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-3xl font-bold mt-10 mb-4 text-white"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-2xl font-semibold mt-8 mb-3 text-white"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-gray-300 leading-relaxed mb-4"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc list-inside mb-4 space-y-2 text-gray-300"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-inside mb-4 space-y-2 text-gray-300"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-300 ml-4" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="px-2 py-1 bg-[#1a1a1a] rounded text-[#bbf838] text-sm"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block p-4 bg-[#1a1a1a] rounded-lg overflow-x-auto text-sm"
                      {...props}
                    />
                  ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-[#bbf838] pl-4 py-2 my-4 bg-[#1a1a1a]/50 rounded-r-lg text-gray-300 italic"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-[#bbf838] hover:text-[#8bc34a] underline transition-colors"
                    {...props}
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table
                      className="min-w-full border border-gray-800 rounded-lg"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-[#1a1a1a]" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-gray-800 px-4 py-2 text-left font-semibold text-white"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="border border-gray-800 px-4 py-2 text-gray-300"
                    {...props}
                  />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-gray-800" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-white" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic text-gray-200" {...props} />
                ),
              }}
            >
              {highlightedMarkdown}
            </ReactMarkdown>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-6 border-t border-gray-800 flex justify-between items-center">
            <a
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors"
            >
              ← Back to Home
            </a>
            <div className="text-sm text-gray-400">
              Last updated: September 30, 2025
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default WhitepaperPage;
