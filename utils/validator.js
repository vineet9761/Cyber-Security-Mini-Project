
const dns = require("node:dns").promises;
const net = require("node:net");

function isPrivateIPv4(ip) {
    const parts = ip.split(".").map(Number);

    if (parts.length !== 4 || parts.some(n => n < 0 || n > 255)) {
        return true;
    }

    const [a, b] = parts;

    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 192 && b === 0) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 198 && b === 51) ||
        (a === 203 && b === 0)
    );
}

function isPrivateIPv6(ip) {
    const address = ip.toLowerCase().split("%")[0];

    if (
        address === "::" ||
        address === "::1" ||
        address.startsWith("fc") ||
        address.startsWith("fd") ||
        /^fe[89ab]/.test(address)
    ) {
        return true;
    }

    // Reject IPv4-mapped IPv6 addresses rather than risk bypassing
    // the IPv4 address restrictions.
    if (address.includes(".")) {
        return true;
    }

    // Block IPv6 multicast and common special-use prefixes.
    if (address.startsWith("ff") || address.startsWith("2001:db8:")) {
        return true;
    }

    return false;
}

function isBlockedAddress(address) {
    const version = net.isIP(address);

    if (version === 4) return isPrivateIPv4(address);
    if (version === 6) return isPrivateIPv6(address);

    return true;
}

async function validateURL(input) {
    try {
        if (typeof input !== "string" || !input.trim()) {
            return {
                valid: false,
                message: "Please enter a website URL."
            };
        }

        const parsed = new URL(input.trim());

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return {
                valid: false,
                message: "Only HTTP and HTTPS URLs are allowed."
            };
        }

        if (parsed.username || parsed.password) {
            return {
                valid: false,
                message: "URLs containing usernames or passwords are not allowed."
            };
        }

        if (parsed.port && !["80", "443"].includes(parsed.port)) {
            return {
                valid: false,
                message: "Only standard HTTP and HTTPS ports are allowed."
            };
        }

        const hostname = parsed.hostname
            .toLowerCase()
            .replace(/^\[|\]$/g, "");

        if (
            hostname === "localhost" ||
            hostname.endsWith(".localhost") ||
            hostname.endsWith(".local") ||
            hostname.endsWith(".internal") ||
            hostname.endsWith(".test")
        ) {
            return {
                valid: false,
                message: "Local and internal hostnames cannot be scanned."
            };
        }

        if (net.isIP(hostname)) {
            if (isBlockedAddress(hostname)) {
                return {
                    valid: false,
                    message: "Private or special-use IP addresses cannot be scanned."
                };
            }
        } else {
            // Check DNS results before allowing the request.
            const addresses = await dns.lookup(hostname, { all: true });

            if (
                addresses.length === 0 ||
                addresses.some(item => isBlockedAddress(item.address))
            ) {
                return {
                    valid: false,
                    message: "This hostname resolves to a restricted network address."
                };
            }
        }

        return {
            valid: true,
            message: "URL validated.",
            url: parsed.href
        };
    } catch {
        return {
            valid: false,
            message: "Invalid URL or hostname could not be resolved."
        };
    }
}

module.exports ={ validateURL };
