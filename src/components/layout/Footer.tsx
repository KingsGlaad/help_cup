import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Copa 2026. Feito para os fãs de futebol.</p>
        <p className="mt-1 text-xs">Dados fornecidos por worldcup26.ir API</p>
      </div>
    </footer>
  );
}
