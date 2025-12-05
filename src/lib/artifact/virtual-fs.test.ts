
import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem, VirtualFile } from './virtual-fs';

describe('VirtualFileSystem', () => {
  let vfs: VirtualFileSystem;
  const initialFiles: VirtualFile[] = [
    { path: 'index.html', content: '<html></html>', type: 'html' },
    { path: 'styles/main.css', content: 'body { color: red; }', type: 'css' },
    { path: 'src/app.js', content: 'console.log("hello");', type: 'js' },
    { path: 'src/utils/helper.js', content: 'export const x = 1;', type: 'js' }
  ];

  beforeEach(() => {
    vfs = new VirtualFileSystem(initialFiles);
  });

  it('should initialize with files', () => {
    expect(vfs.getAllFiles()).toHaveLength(4);
  });

  it('should normalize paths', () => {
    expect(vfs.normalizePath('/index.html')).toBe('index.html');
    expect(vfs.normalizePath('./index.html')).toBe('index.html');
    expect(vfs.normalizePath('src/../index.html')).toBe('index.html');
    expect(vfs.normalizePath('src/./app.js')).toBe('src/app.js');
  });

  it('should read files', () => {
    const file = vfs.readFile('styles/main.css');
    expect(file).toBeDefined();
    expect(file?.content).toBe('body { color: red; }');
  });

  it('should resolve paths', () => {
    expect(vfs.resolvePath('src/app.js', './utils/helper.js')).toBe('src/utils/helper.js');
    expect(vfs.resolvePath('src/app.js', '../index.html')).toBe('index.html');
    expect(vfs.resolvePath('src/utils/helper.js', '../../styles/main.css')).toBe('styles/main.css');
  });

  it('should generate file tree', () => {
    const tree = vfs.getFileTree();
    expect(tree.name).toBe('root');
    expect(tree.children).toBeDefined();

    // Check top level
    const srcFolder = tree.children?.find(c => c.name === 'src');
    const stylesFolder = tree.children?.find(c => c.name === 'styles');
    const indexFile = tree.children?.find(c => c.name === 'index.html');

    expect(srcFolder).toBeDefined();
    expect(srcFolder?.type).toBe('folder');
    expect(stylesFolder).toBeDefined();
    expect(indexFile).toBeDefined();
    expect(indexFile?.type).toBe('file');

    // Check nested
    const appFile = srcFolder?.children?.find(c => c.name === 'app.js');
    const utilsFolder = srcFolder?.children?.find(c => c.name === 'utils');

    expect(appFile).toBeDefined();
    expect(utilsFolder).toBeDefined();

    const helperFile = utilsFolder?.children?.find(c => c.name === 'helper.js');
    expect(helperFile).toBeDefined();
  });
});
