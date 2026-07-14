import { memo } from 'react';

function Footer() {
  return (
    <footer className="te-footer">
      &copy; {new Date().getFullYear()} <span>ThinkEasy</span> — Business Intelligence for Indian Entrepreneurs
    </footer>
  );
}

export default memo(Footer);
