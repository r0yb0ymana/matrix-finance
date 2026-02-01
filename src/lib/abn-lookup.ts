/**
 * ABN Lookup Service
 *
 * Integration with Australian Business Register (ABR) Web Services
 * https://abr.business.gov.au/Tools/WebServices
 */

// =====================================================
// Types
// =====================================================

export interface ABNLookupResult {
  abn: string;
  abnStatus: string;
  entityName: string;
  entityType: string;
  gstRegistered: boolean;
  gstRegisteredFrom?: string;
  tradingNames?: string[];
  businessAddress?: {
    stateCode: string;
    postcode: string;
  };
  asicNumber?: string;
}

export interface ABNLookupError {
  error: string;
  message: string;
}

// =====================================================
// ABN Utilities
// =====================================================

/**
 * Validate ABN format (11 digits)
 */
export function isValidABNFormat(abn: string): boolean {
  const cleaned = abn.replace(/\s/g, '');
  return /^\d{11}$/.test(cleaned);
}

/**
 * Validate ABN checksum (Modulus 89)
 * https://abr.business.gov.au/Help/AbnFormat
 */
export function isValidABNChecksum(abn: string): boolean {
  const cleaned = abn.replace(/\s/g, '');

  if (!isValidABNFormat(cleaned)) {
    return false;
  }

  // ABN checksum calculation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = cleaned.split('').map(Number);

  // Subtract 1 from first digit
  digits[0] -= 1;

  // Multiply each digit by its weight
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);

  // Check if remainder is 0
  return sum % 89 === 0;
}

/**
 * Format ABN with spaces (XX XXX XXX XXX)
 */
export function formatABN(abn: string): string {
  const cleaned = abn.replace(/\s/g, '');
  if (cleaned.length !== 11) {
    return abn;
  }
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 11)}`;
}

// =====================================================
// ABR API Integration
// =====================================================

const ABR_API_URL = 'https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx';

/**
 * Lookup ABN details from ABR
 */
export async function lookupABN(abn: string): Promise<ABNLookupResult> {
  const apiKey = process.env.ABR_GUID;

  if (!apiKey) {
    throw new Error('ABR_GUID environment variable not configured');
  }

  // Clean and validate ABN
  const cleanedABN = abn.replace(/\s/g, '');

  if (!isValidABNFormat(cleanedABN)) {
    throw new Error('Invalid ABN format. ABN must be 11 digits.');
  }

  if (!isValidABNChecksum(cleanedABN)) {
    throw new Error('Invalid ABN. Please check the number and try again.');
  }

  // Call ABR API
  const url = `${ABR_API_URL}/ABRSearchByABN?searchString=${cleanedABN}&includeHistoricalDetails=N&authenticationGuid=${apiKey}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`ABR API error: ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseABRResponse(xmlText, cleanedABN);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to lookup ABN: ${error.message}`);
    }
    throw new Error('Failed to lookup ABN');
  }
}

/**
 * Parse ABR XML response
 */
function parseABRResponse(xmlText: string, abn: string): ABNLookupResult {
  // Check for exception in response
  if (xmlText.includes('<exception>')) {
    const exceptionMatch = xmlText.match(/<exceptionDescription>(.*?)<\/exceptionDescription>/);
    const message = exceptionMatch ? exceptionMatch[1] : 'Unknown error from ABR';
    throw new Error(message);
  }

  // Extract entity name (try main name first, then trading name)
  const mainNameMatch = xmlText.match(/<mainName>[\s\S]*?<organisationName>(.*?)<\/organisationName>/);
  const tradingNameMatch = xmlText.match(/<mainTradingName>[\s\S]*?<organisationName>(.*?)<\/organisationName>/);
  const entityName = mainNameMatch?.[1] || tradingNameMatch?.[1] || '';

  if (!entityName) {
    throw new Error('ABN not found or business name not available');
  }

  // Extract entity type
  const entityTypeMatch = xmlText.match(/<entityTypeCode>(.*?)<\/entityTypeCode>/);
  const entityTypeCode = entityTypeMatch?.[1] || '';
  const entityType = mapEntityTypeCode(entityTypeCode);

  // Extract ABN status
  const abnStatusMatch = xmlText.match(/<ABN status="(.*?)">/);
  const abnStatus = abnStatusMatch?.[1] || 'Active';

  // Extract GST registration
  const gstMatch = xmlText.match(/<GST>[\s\S]*?<effectiveFrom>(.*?)<\/effectiveFrom>/);
  const gstRegistered = !!gstMatch;
  const gstRegisteredFrom = gstMatch?.[1];

  // Extract trading names
  const tradingNames: string[] = [];
  const tradingNameRegex = /<businessName>[\s\S]*?<organisationName>(.*?)<\/organisationName>/g;
  let match;
  while ((match = tradingNameRegex.exec(xmlText)) !== null) {
    if (match[1] && match[1] !== entityName) {
      tradingNames.push(match[1]);
    }
  }

  // Extract business address
  const stateMatch = xmlText.match(/<addressDetails>[\s\S]*?<stateCode>(.*?)<\/stateCode>/);
  const postcodeMatch = xmlText.match(/<addressDetails>[\s\S]*?<postcode>(.*?)<\/postcode>/);

  const businessAddress = stateMatch && postcodeMatch ? {
    stateCode: stateMatch[1],
    postcode: postcodeMatch[1],
  } : undefined;

  // Extract ASIC number (for companies)
  const asicMatch = xmlText.match(/<ASICNumber>(.*?)<\/ASICNumber>/);
  const asicNumber = asicMatch?.[1];

  return {
    abn: formatABN(abn),
    abnStatus,
    entityName,
    entityType,
    gstRegistered,
    gstRegisteredFrom,
    tradingNames: tradingNames.length > 0 ? tradingNames : undefined,
    businessAddress,
    asicNumber,
  };
}

/**
 * Map ABR entity type codes to human-readable names
 */
function mapEntityTypeCode(code: string): string {
  const entityTypes: Record<string, string> = {
    'IND': 'Individual/Sole Trader',
    'PRV': 'Australian Private Company',
    'PUB': 'Australian Public Company',
    'PTR': 'Other Partnership',
    'PTY': 'Partnership',
    'LPT': 'Limited Partnership',
    'DIT': 'Discretionary Investment Trust',
    'DES': 'Discretionary Services Management Trust',
    'DTR': 'Discretionary Trading Trust',
    'FHS': 'Family Partnership',
    'FPT': 'Family Partnership',
    'HYT': 'Hybrid Trust',
    'UTR': 'Unit Trust',
    'ADF': 'Approved Deposit Fund',
    'ARF': 'APRA Regulated Fund',
    'CIV': 'Corporate Unit Trust',
    'CGE': 'Co-operative',
    'NPF': 'Non-profit Organisation',
    'NPR': 'Non-profit Organisation',
    'SUP': 'Pooled Superannuation Trust',
    'SDF': 'Self Managed Superannuation Fund',
    'SMF': 'Self Managed Superannuation Fund',
    'STR': 'Strata Title',
    'UNC': 'Unincorporated Association',
  };

  return entityTypes[code] || code;
}

/**
 * Mock ABN lookup for development
 */
export async function mockLookupABN(abn: string): Promise<ABNLookupResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const cleanedABN = abn.replace(/\s/g, '');

  // Mock data for common test ABNs
  const mockData: Record<string, ABNLookupResult> = {
    // Matrix Finance (example)
    '51824753556': {
      abn: '51 824 753 556',
      abnStatus: 'Active',
      entityName: 'MATRIX EQUIPMENT FINANCE PTY LTD',
      entityType: 'Australian Private Company',
      gstRegistered: true,
      gstRegisteredFrom: '2020-01-01',
      tradingNames: ['Matrix Finance'],
      businessAddress: {
        stateCode: 'NSW',
        postcode: '2000',
      },
      asicNumber: '123456789',
    },
  };

  if (mockData[cleanedABN]) {
    return mockData[cleanedABN];
  }

  // Return generic mock for valid ABNs
  if (isValidABNChecksum(cleanedABN)) {
    return {
      abn: formatABN(cleanedABN),
      abnStatus: 'Active',
      entityName: 'TEST BUSINESS PTY LTD',
      entityType: 'Australian Private Company',
      gstRegistered: true,
      gstRegisteredFrom: '2020-01-01',
      businessAddress: {
        stateCode: 'NSW',
        postcode: '2000',
      },
    };
  }

  throw new Error('Invalid ABN checksum');
}
