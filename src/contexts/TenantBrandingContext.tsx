import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTenant } from '@/hooks/useTenant';

interface TenantBranding {
  logoUrl: string;
  restaurantName: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

interface TenantBrandingContextType {
  logoUrl: string;
  restaurantName: string;
  updateBranding: (branding: Partial<TenantBranding>) => void;
}

const TenantBrandingContext = createContext<TenantBrandingContextType | undefined>(undefined);

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): string => {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const TenantBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const [branding, setBranding] = useState<TenantBranding>({
    logoUrl: '/placeholder.svg',
    restaurantName: 'Demo Restaurant',
  });

  // Update branding when tenant data changes
  useEffect(() => {
    if (tenant) {
      const newBranding: TenantBranding = {
        logoUrl: tenant.logo_url || '/placeholder.svg',
        restaurantName: tenant.name || 'Demo Restaurant',
        // Note: tenant.settings structure needs to be defined in types
        // For now, using fallback values
        primaryColor: undefined,
        accentColor: undefined,
        fontFamily: undefined,
        borderRadius: undefined,
      };
      
      setBranding(newBranding);
      applyBrandingToCSS(newBranding);
    }
  }, [tenant]);

  // Apply branding to CSS variables
  const applyBrandingToCSS = (brandingData: TenantBranding) => {
    const root = document.documentElement;

    // Apply primary color if provided
    if (brandingData.primaryColor) {
      try {
        const hslColor = hexToHsl(brandingData.primaryColor);
        root.style.setProperty('--brand', hslColor);
        root.style.setProperty('--ring', hslColor);
        
        // Create a lighter variant for foreground
        const [h, s, l] = hslColor.split(' ');
        const lighterL = Math.min(parseInt(l.replace('%', '')) + 20, 90);
        root.style.setProperty('--brand-foreground', `${h} ${s} ${lighterL}%`);
      } catch (error) {
        console.warn('Invalid primary color format:', brandingData.primaryColor);
      }
    }

    // Apply accent color if provided
    if (brandingData.accentColor) {
      try {
        const hslColor = hexToHsl(brandingData.accentColor);
        root.style.setProperty('--accent', hslColor);
        
        // Create foreground variant
        const [h, s, l] = hslColor.split(' ');
        const lighterL = Math.min(parseInt(l.replace('%', '')) + 20, 90);
        root.style.setProperty('--accent-foreground', `${h} ${s} ${lighterL}%`);
      } catch (error) {
        console.warn('Invalid accent color format:', brandingData.accentColor);
      }
    }

    // Apply border radius if provided
    if (brandingData.borderRadius) {
      root.style.setProperty('--radius', brandingData.borderRadius);
    }

    // Apply font family if provided
    if (brandingData.fontFamily) {
      root.style.setProperty('font-family', brandingData.fontFamily);
    }
  };

  const updateBranding = (newBranding: Partial<TenantBranding>) => {
    const updatedBranding = { ...branding, ...newBranding };
    setBranding(updatedBranding);
    applyBrandingToCSS(updatedBranding);
  };

  return (
    <TenantBrandingContext.Provider
      value={{
        logoUrl: branding.logoUrl,
        restaurantName: branding.restaurantName,
        updateBranding,
      }}
    >
      {children}
    </TenantBrandingContext.Provider>
  );
};

export const useTenantBranding = () => {
  const context = useContext(TenantBrandingContext);
  if (context === undefined) {
    throw new Error('useTenantBranding must be used within a TenantBrandingProvider');
  }
  return context;
};