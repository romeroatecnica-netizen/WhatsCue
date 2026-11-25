export interface CountryDialOption {
  iso: string;
  dial: string;
  name: string;
}

export const POPULAR_COUNTRY_CODES: CountryDialOption[] = [
  { iso: 'US', dial: '1', name: 'United States / Canada (+1)' },
  { iso: 'ES', dial: '34', name: 'España (+34)' },
  { iso: 'MX', dial: '52', name: 'México (+52)' },
  { iso: 'AR', dial: '54', name: 'Argentina (+54)' },
  { iso: 'CO', dial: '57', name: 'Colombia (+57)' },
  { iso: 'CL', dial: '56', name: 'Chile (+56)' },
  { iso: 'PE', dial: '51', name: 'Perú (+51)' },
  { iso: 'BR', dial: '55', name: 'Brasil (+55)' },
  { iso: 'PT', dial: '351', name: 'Portugal (+351)' },
  { iso: 'GB', dial: '44', name: 'United Kingdom (+44)' },
  { iso: 'FR', dial: '33', name: 'France (+33)' },
  { iso: 'DE', dial: '49', name: 'Deutschland (+49)' },
  { iso: 'IT', dial: '39', name: 'Italia (+39)' },
  { iso: 'NL', dial: '31', name: 'Nederland (+31)' },
  { iso: 'CH', dial: '41', name: 'Schweiz / Suisse (+41)' },
  { iso: 'SA', dial: '966', name: 'Saudi Arabia (+966)' },
  { iso: 'AE', dial: '971', name: 'United Arab Emirates (+971)' },
  { iso: 'EG', dial: '20', name: 'Egypt (+20)' },
  { iso: 'MA', dial: '212', name: 'Morocco (+212)' },
  { iso: 'IN', dial: '91', name: 'India (+91)' },
  { iso: 'RU', dial: '7', name: 'Russia / KZ (+7)' },
  { iso: 'CN', dial: '86', name: 'China (+86)' },
  { iso: 'JP', dial: '81', name: 'Japan (+81)' },
  { iso: 'AU', dial: '61', name: 'Australia (+61)' },
];
