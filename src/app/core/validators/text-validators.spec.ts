import { FormControl } from '@angular/forms';
import { requiredText } from './text-validators';

describe('requiredText', () => {
  it('treats empty and whitespace-only text as missing', () => {
    expect(requiredText(new FormControl(''))).toEqual({ required: true });
    expect(requiredText(new FormControl('   \t '))).toEqual({ required: true });
  });

  it('accepts real text, including emoji and accents', () => {
    expect(requiredText(new FormControl('Ñoño Food Bank 🍲'))).toBeNull();
    expect(requiredText(new FormControl(' A '))).toBeNull();
  });

  it('leaves non-text values to other validators', () => {
    expect(requiredText(new FormControl(12))).toBeNull();
  });
});
