import { classifyContentType, classifyVideoFormat } from '@/lib/content-map';

describe('classifyContentType', () => {
  it('detects TTL prefix', () => {
    expect(classifyContentType('TTL_Short 1_Ron Dawson')).toBe('ttl');
    expect(classifyContentType('TTL Full Amanda Natividad')).toBe('ttl');
  });

  it('detects POV prefix', () => {
    expect(classifyContentType('POV_Short A Hook 1')).toBe('pov');
    expect(classifyContentType('POV Short B Landing 2')).toBe('pov');
  });

  it('returns unknown for unrecognized titles', () => {
    expect(classifyContentType('Some random video')).toBe('unknown');
  });

  it('is case-insensitive', () => {
    expect(classifyContentType('ttl_short 1_ron dawson')).toBe('ttl');
  });

  it('respects manual videoId override', () => {
    expect(classifyContentType('Some video', 'manual-ttl-id')).toBe('ttl');
  });
});

describe('classifyVideoFormat', () => {
  it('detects short from title', () => {
    expect(classifyVideoFormat('TTL_Short 1_Ron Dawson')).toBe('short');
  });

  it('detects horizontal from title', () => {
    expect(classifyVideoFormat('TTL_Horizontal Clip 1')).toBe('horizontal');
  });

  it('detects long-form from duration', () => {
    expect(classifyVideoFormat('Episode 42 Full Interview', 2400)).toBe('long-form');
  });

  it('detects short from duration under 180s', () => {
    expect(classifyVideoFormat('Unknown title', 60)).toBe('short');
  });
});
