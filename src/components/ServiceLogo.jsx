import { createElement, useState } from 'react'
import { getServiceDomain } from '../lib/serviceDomains'
import { useTheme } from '../context/ThemeContext'
import { Zap, Droplet, Flame, Wifi, Smartphone, Home, Trash2, Car, Shield, GraduationCap, ShieldPlus, Dumbbell } from 'lucide-react'

function getFallbackIcon(name) {
    if (!name) return null;
    const lower = name.toLowerCase();

    // Utilities
    if (lower.includes('electric') || lower.includes('power') || lower.includes('energy')) return Zap;
    if (lower.includes('water') || lower.includes('sewer')) return Droplet;
    if (lower.includes('gas') || lower.includes('heat')) return Flame;
    if (lower.includes('trash') || lower.includes('garbage') || lower.includes('waste')) return Trash2;
    if (lower.includes('internet') || lower.includes('wifi') || lower.includes('broadband') || lower.includes('fiber')) return Wifi;
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('cellular')) return Smartphone;

    // Rent & Mortgage
    if (lower.includes('rent') || lower.includes('mortgage') || lower.includes('hoa') || lower.includes('lease')) return Home;

    // Auto & Transport
    if (lower.includes('car') || lower.includes('auto') || lower.includes('vehicle') || lower.includes('toll')) return Car;

    // Insurance & Health
    if (lower.includes('insurance')) return Shield;
    if (lower.includes('health') || lower.includes('dental') || lower.includes('medical') || lower.includes('vision')) return ShieldPlus;
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('club')) return Dumbbell;

    // Education
    if (lower.includes('student') || lower.includes('tuition') || lower.includes('school') || lower.includes('college')) return GraduationCap;

    return null;
}

/**
 * Renders a service logo using Google Favicon API → special icon → colored initial fallback.
 */
export default function ServiceLogo({ name, domain: providedDomain = null, size = 32, catColor = '#6B7280', radius = 10 }) {
    const { T } = useTheme()
    const domain = providedDomain || getServiceDomain(name)
    const fallbackIcon = getFallbackIcon(name)
    const [src] = useState(
        domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null
    )
    const [failed, setFailed] = useState(!domain)

    const handleError = () => {
        setFailed(true)
    }

    if (failed || !src) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    background: catColor + '22',
                    border: `1px solid ${catColor}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: size * 0.42,
                    fontWeight: 700,
                    color: catColor,
                    flexShrink: 0,
                    fontFamily: 'system-ui',
                }}
            >
                {fallbackIcon ? (
                    createElement(fallbackIcon, { size: size * 0.55, color: catColor })
                ) : (
                    name.charAt(0).toUpperCase()
                )}
            </div>
        )
    }

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                background: T.bgElevated,
                border: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                padding: size > 28 ? 4 : 2,
            }}
        >
            <img
                src={src}
                alt={name}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: radius - 3,
                }}
            />
        </div>
    )
}
