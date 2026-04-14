/**
 * AgentsMD Library
 * Core reusable library for generating and managing AGENTS.md files.
 * Works in both browser (window.AgentsMDLib) and Node.js (module.exports).
 */
(function (global) {
  'use strict';

  const BASE_URL =
    typeof window !== 'undefined' && window.location
      ? window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')
      : '';

  const AgentsMDLib = {
    /* ------------------------------------------------------------------ */
    /* Internal state                                                       */
    /* ------------------------------------------------------------------ */
    _state: {
      selectedBlocks: [],
      loadedTemplates: {},
      loadedExamples: {},
    },

    /* ------------------------------------------------------------------ */
    /* Event system                                                         */
    /* ------------------------------------------------------------------ */
    _listeners: {},

    on(event, handler) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
      return this;
    },

    off(event, handler) {
      if (!this._listeners[event]) return this;
      this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
      return this;
    },

    emit(event, data) {
      if (!this._listeners[event]) return this;
      this._listeners[event].forEach((h) => h(data));
      return this;
    },

    /* ------------------------------------------------------------------ */
    /* HTTP helpers                                                         */
    /* ------------------------------------------------------------------ */
    async _fetchJSON(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return res.json();
    },

    /* ------------------------------------------------------------------ */
    /* Template API                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Load a single template by its ID.
     * @param {string} id - Template identifier (e.g. "frontend")
     * @returns {Promise<object>}
     */
    async loadTemplate(id) {
      if (this._state.loadedTemplates[id]) return this._state.loadedTemplates[id];
      const url = `${BASE_URL}/api/templates/${id}.json`;
      const template = await this._fetchJSON(url);
      this._state.loadedTemplates[id] = template;
      this.emit('templateLoaded', template);
      return template;
    },

    /**
     * Load the template index listing all available templates.
     * @returns {Promise<object[]>}
     */
    async loadAllTemplates() {
      const url = `${BASE_URL}/api/templates/index.json`;
      const index = await this._fetchJSON(url);
      this.emit('allTemplatesLoaded', index);
      return index;
    },

    /* ------------------------------------------------------------------ */
    /* Example API                                                          */
    /* ------------------------------------------------------------------ */

    /**
     * Load a single example by its ID.
     * @param {string} id - Example identifier (e.g. "fullstack-app")
     * @returns {Promise<object>}
     */
    async loadExample(id) {
      if (this._state.loadedExamples[id]) return this._state.loadedExamples[id];
      const url = `${BASE_URL}/api/examples/${id}.json`;
      const example = await this._fetchJSON(url);
      this._state.loadedExamples[id] = example;
      this.emit('exampleLoaded', example);
      return example;
    },

    /**
     * Load the examples index listing all available examples.
     * @returns {Promise<object[]>}
     */
    async loadAllExamples() {
      const url = `${BASE_URL}/api/examples/index.json`;
      const index = await this._fetchJSON(url);
      this.emit('allExamplesLoaded', index);
      return index;
    },

    /* ------------------------------------------------------------------ */
    /* Block / selection state management                                   */
    /* ------------------------------------------------------------------ */

    /**
     * Add a template block to the selected set.
     * @param {object} block - A template object loaded via loadTemplate()
     */
    addBlock(block) {
      const exists = this._state.selectedBlocks.find((b) => b.id === block.id);
      if (!exists) {
        this._state.selectedBlocks.push(block);
        this.emit('blockAdded', block);
        this.emit('selectionChanged', this._state.selectedBlocks);
      }
    },

    /**
     * Remove a template block from the selected set.
     * @param {string} id - Template ID to remove
     */
    removeBlock(id) {
      const idx = this._state.selectedBlocks.findIndex((b) => b.id === id);
      if (idx !== -1) {
        const removed = this._state.selectedBlocks.splice(idx, 1)[0];
        this.emit('blockRemoved', removed);
        this.emit('selectionChanged', this._state.selectedBlocks);
      }
    },

    /**
     * Toggle a block selection by ID.  Returns true if now selected.
     * @param {object} block
     * @returns {boolean}
     */
    toggleBlock(block) {
      const exists = this._state.selectedBlocks.find((b) => b.id === block.id);
      if (exists) {
        this.removeBlock(block.id);
        return false;
      } else {
        this.addBlock(block);
        return true;
      }
    },

    /**
     * Returns whether a block ID is currently selected.
     * @param {string} id
     * @returns {boolean}
     */
    isSelected(id) {
      return !!this._state.selectedBlocks.find((b) => b.id === id);
    },

    /**
     * Return a copy of the currently selected blocks.
     * @returns {object[]}
     */
    getSelectedBlocks() {
      return [...this._state.selectedBlocks];
    },

    /**
     * Clear all selected blocks.
     */
    clearBlocks() {
      this._state.selectedBlocks = [];
      this.emit('selectionCleared', []);
      this.emit('selectionChanged', []);
    },

    /* ------------------------------------------------------------------ */
    /* AGENTS.md generation & parsing                                       */
    /* ------------------------------------------------------------------ */

    /**
     * Generate AGENTS.md markdown from an array of template block objects.
     * @param {object[]} selectedBlocks - Array of template objects (each with .sections[])
     * @returns {string} - Complete AGENTS.md markdown content
     */
    generateAgentsMD(selectedBlocks) {
      if (!Array.isArray(selectedBlocks) || selectedBlocks.length === 0) {
        return '# AGENTS.md\n\nNo templates selected.\n';
      }

      const lines = [
        '# AGENTS.md',
        '',
        '> Auto-generated by [AGENTS.md Generator](https://github.com/agentsmd-generator)',
        `> Generated: ${new Date().toISOString().split('T')[0]}`,
        '',
        '---',
        '',
      ];

      const toc = [];
      selectedBlocks.forEach((block) => {
        if (block.sections && block.sections.length > 0) {
          block.sections.forEach((section) => {
            toc.push(`- [${section.title}](#${this._slugify(section.title)})`);
          });
        }
      });

      if (toc.length > 0) {
        lines.push('## Table of Contents', '');
        toc.forEach((t) => lines.push(t));
        lines.push('', '---', '');
      }

      selectedBlocks.forEach((block) => {
        if (block.sections && block.sections.length > 0) {
          block.sections.forEach((section) => {
            lines.push(section.content, '', '---', '');
          });
        }
      });

      // Remove trailing separator
      while (lines[lines.length - 1] === '' || lines[lines.length - 1] === '---') {
        lines.pop();
      }

      return lines.join('\n') + '\n';
    },

    /**
     * Parse AGENTS.md markdown content into a structured object.
     * @param {string} content - Raw markdown string
     * @returns {{ title: string, sections: Array<{title: string, content: string}> }}
     */
    parseAgentsMD(content) {
      if (typeof content !== 'string') throw new TypeError('content must be a string');

      const lines = content.split('\n');
      const result = { title: '', sections: [] };

      let currentSection = null;
      let buffer = [];

      const flushSection = () => {
        if (currentSection) {
          currentSection.content = buffer.join('\n').trim();
          result.sections.push(currentSection);
          currentSection = null;
          buffer = [];
        }
      };

      lines.forEach((line) => {
        const h1 = line.match(/^# (.+)/);
        const h2 = line.match(/^## (.+)/);

        if (h1 && !result.title) {
          result.title = h1[1].trim();
        } else if (h2) {
          flushSection();
          currentSection = { title: h2[1].trim(), content: '' };
          buffer = [line];
        } else if (currentSection) {
          buffer.push(line);
        }
      });

      flushSection();
      return result;
    },

    /* ------------------------------------------------------------------ */
    /* Utilities                                                            */
    /* ------------------------------------------------------------------ */

    /**
     * Convert a heading string to a GitHub-compatible anchor slug.
     * @param {string} str
     * @returns {string}
     */
    _slugify(str) {
      return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    },
  };

  /* ------------------------------------------------------------------ */
  /* Export                                                               */
  /* ------------------------------------------------------------------ */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentsMDLib;
  } else {
    global.AgentsMDLib = AgentsMDLib;
  }
})(typeof window !== 'undefined' ? window : global);
