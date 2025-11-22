# Annex 9: External Integrations - Technical Specifications

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./08-implementation-roadmap.md) | [Next →](./annex-10-special-workflows.md)

---

## Obiectiv

Specificații tehnice detaliate pentru integrările cu servicii externe obligatorii și opționale.

---

## 9.1. ANAF (Agenția Națională de Administrare Fiscală)

### 9.1.1. Verificare CUI (Cod Unic Înregistrare)

**API Endpoint:** `https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva`

**Method:** POST

**Authentication:** None (public endpoint, rate limited)

**Request Format:**
```json
[
  {
    "cui": 12345678,
    "data": "2025-11-21"
  }
]
```

**Response Format:**
```json
{
  "cod": 200,
  "message": "SUCCESS",
  "found": [
    {
      "date_generale": {
        "cui": 12345678,
        "data": "2025-11-21",
        "denumire": "SC EXEMPLU SRL",
        "adresa": "BUCURESTI SECTORUL 1, STR. EXEMPLU, NR. 10",
        "nrRegCom": "J40/1234/2020",
        "telefon": "0212345678",
        "fax": "",
        "codPostal": "010101",
        "act": "Act constitutiv",
        "stare_inactiv": false,
        "data_inregistrare": "2020-01-15",
        "cod_CAEN": "6201",
        "iban": "RO49AAAA1B31007593840000",
        "statusRO_e_Factura": false,
        "organFiscalCompetent": "Administrația Sectorială de Finanțe Publice Sector 1",
        "forma_de_proprietate": "PROPR.PRIVATA-CAPITAL PRIVAT AUTOHTON",
        "forma_organizare": "PERSOANA JURIDICA ROMANA",
        "forma_juridica": "SOCIETATE COMERCIALĂ CU RĂSPUNDERE LIMITATĂ"
      },
      "inregistrare_scop_Tva": {
        "scpTVA": true,
        "perioade_TVA": [
          {
            "data_inceput_ScpTVA": "2020-02-01",
            "data_sfarsit_ScpTVA": "",
            "data_anul_imp_ScpTVA": "",
            "mesaj_ScpTVA": ""
          }
        ]
      },
      "inregistrare_REMI": {
        "dataInceputRegimMiniIntrep": "",
        "dataAnulareRegimMiniIntrep": "",
        "dataActualizareRegimMiniIntrep": "",
        "statusRegimMiniIntrep": false
      },
      "stare_inactiv": {
        "dataInactivare": "",
        "dataReactivare": "",
        "dataPublicare": "",
        "dataRadiere": "",
        "statusInactivi": false
      },
      "inregistrare_SplitTVA": {
        "dataInceputSplitTVA": "",
        "dataAnulareSplitTVA": "",
        "statusSplitTVA": false
      },
      "adresa_sediu_social": {
        "sdenumire_Strada": "STR. EXEMPLU",
        "snumar_Strada": "10",
        "sdenumire_Localitate": "BUCURESTI SECTORUL 1",
        "scod_Localitate": "179132",
        "sdenumire_Judet": "BUCURESTI",
        "scod_Judet": "40",
        "scod_JudetAuto": "B",
        "stara": "ROMANIA",
        "sdetalii_Adresa": "",
        "scod_Postal": "010101"
      },
      "adresa_domiciliu_fiscal": {
        "ddenumire_Strada": "STR. EXEMPLU",
        "dnumar_Strada": "10",
        "ddenumire_Localitate": "BUCURESTI SECTORUL 1",
        "dcod_Localitate": "179132",
        "ddenumire_Judet": "BUCURESTI",
        "dcod_Judet": "40",
        "dcod_JudetAuto": "B",
        "dtara": "ROMANIA",
        "ddetalii_Adresa": "",
        "dcod_Postal": "010101"
      }
    }
  ],
  "notFound": []
}
```

**Error Handling:**
```json
{
  "cod": 400,
  "message": "Cerere invalida",
  "notFound": [
    {
      "cui": 99999999,
      "data": "2025-11-21"
    }
  ]
}
```

**Implementation (C#):**
```csharp
public class AnafService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AnafService> _logger;

    public AnafService(HttpClient httpClient, IMemoryCache cache, ILogger<AnafService> logger)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://webservicesp.anaf.ro/");
        _cache = cache;
        _logger = logger;
    }

    public async Task<AnafCompanyInfo> GetCompanyInfoAsync(string cui, DateTime? date = null)
    {
        var cacheKey = $"anaf_cui_{cui}_{date?.ToString("yyyy-MM-dd") ?? DateTime.Today.ToString("yyyy-MM-dd")}";
        
        // Check cache first (24h TTL)
        if (_cache.TryGetValue(cacheKey, out AnafCompanyInfo cachedInfo))
        {
            _logger.LogInformation("ANAF data retrieved from cache for CUI {CUI}", cui);
            return cachedInfo;
        }

        var request = new[]
        {
            new { cui = int.Parse(cui), data = (date ?? DateTime.Today).ToString("yyyy-MM-dd") }
        };

        var response = await _httpClient.PostAsJsonAsync("PlatitorTvaRest/api/v8/ws/tva", request);
        
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("ANAF API error: {StatusCode}", response.StatusCode);
            throw new ExternalServiceException("ANAF API unavailable");
        }

        var result = await response.Content.ReadFromJsonAsync<AnafResponse>();

        if (result?.Found?.Any() != true)
        {
            throw new NotFoundException($"CUI {cui} not found in ANAF database");
        }

        var companyInfo = MapToCompanyInfo(result.Found[0]);
        
        // Cache for 24 hours
        _cache.Set(cacheKey, companyInfo, TimeSpan.FromHours(24));
        
        _logger.LogInformation("ANAF data retrieved for CUI {CUI}", cui);
        return companyInfo;
    }

    private AnafCompanyInfo MapToCompanyInfo(AnafCompanyData data)
    {
        return new AnafCompanyInfo
        {
            Cui = data.DateGenerale.Cui.ToString(),
            Denumire = data.DateGenerale.Denumire,
            Adresa = data.DateGenerale.Adresa,
            NrRegCom = data.DateGenerale.NrRegCom,
            Telefon = data.DateGenerale.Telefon,
            CodPostal = data.DateGenerale.CodPostal,
            IsVatPayer = data.InregistreeScopTva?.ScpTVA ?? false,
            VatNumber = data.InregistreeScopTva?.ScpTVA == true 
                ? $"RO{data.DateGenerale.Cui}" 
                : null,
            IsActive = !data.DateGenerale.StareInactiv,
            DataInregistrare = DateTime.Parse(data.DateGenerale.DataInregistrare),
            CodCaen = data.DateGenerale.CodCaen
        };
    }
}
```

**Rate Limits:**
- **100 requests/minute** per IP
- **Retry strategy:** Exponential backoff (1s, 2s, 4s)
- **Fallback:** Manual input dacă API down

---

### 9.1.2. Verificare Certificate Fiscale (PF/PJ)

**API Endpoint:** `https://webservicesp.anaf.ro/AsynchWebService/api/v8/ws/tit`

**Note:** Requires authentication (certificat digital sau API key)

**Request Format:**
```json
[
  {
    "cui": "1234567890123",
    "an": 2025
  }
]
```

**Response:** XML document (extract CF în format PDF/XML)

**Implementation:** Similar cu CUI verification, dar necesită cert authentication.

---

## 9.2. ONRC (Oficiul Național al Registrului Comerțului)

### 9.2.1. Via Recom.ro API

**Base URL:** `https://api.recom.ro/v1`

**Authentication:** Bearer token (API key)

**Endpoint:** `GET /companies/{cui}`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "cui": "12345678",
    "denumire": "SC EXEMPLU SRL",
    "nrRegCom": "J40/1234/2020",
    "dataInfiintare": "2020-01-15",
    "capitalSocial": 200,
    "capitalSocialVarsat": 200,
    "stare": "ACTIVA",
    "sediu": {
      "judet": "BUCURESTI",
      "localitate": "BUCURESTI SECTORUL 1",
      "strada": "STR. EXEMPLU",
      "numar": "10",
      "codPostal": "010101"
    },
    "administratori": [
      {
        "nume": "POPESCU ION",
        "cnp": "1800101123456",
        "functie": "ADMINISTRATOR",
        "dataNumirii": "2020-01-15",
        "dataIncetarii": null
      }
    ],
    "asociati": [
      {
        "nume": "POPESCU ION",
        "parteSociala": 100,
        "valoareParteSociala": 200
      }
    ],
    "codCaen": [
      {
        "cod": "6201",
        "descriere": "Activități de realizare a soft-ului la comandă (software orientat client)",
        "principal": true
      }
    ]
  }
}
```

**Implementation (C#):**
```csharp
public class OnrcService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OnrcService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.recom.ro/v1/");
        _apiKey = config["Recom:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<OnrcCompanyInfo> GetCompanyDetailsAsync(string cui)
    {
        var response = await _httpClient.GetAsync($"companies/{cui}");
        
        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                throw new NotFoundException($"Company with CUI {cui} not found");
            
            throw new ExternalServiceException("ONRC API unavailable");
        }

        var result = await response.Content.ReadFromJsonAsync<RecomApiResponse>();
        return MapToOnrcCompanyInfo(result.Data);
    }
}
```

**Pricing (Recom.ro):**
- **Free tier:** 100 requests/month
- **Paid:** €29/month (1000 requests), €99/month (10,000 requests)

**Rate Limits:** 10 requests/second

---

### 9.2.2. Alternative: OpenAPI.ro

**Base URL:** `https://api.openapi.ro/api`

**Endpoint:** `GET /companies/ro/{cui}`

**Similar structure, pricing: €19/month (500 requests)**

---

## 9.3. RAR (Registrul Auto Român)

### 9.3.1. Via CarVertical API

**Base URL:** `https://api.carvertical.com/v1`

**Authentication:** Bearer token

**Endpoint:** `GET /reports/{vin}`

**Request:**
```http
GET /v1/reports/WVWZZZ1KZBW000001 HTTP/1.1
Host: api.carvertical.com
Authorization: Bearer your_api_token
```

**Response (simplified):**
```json
{
  "vin": "WVWZZZ1KZBW000001",
  "vehicle": {
    "make": "Volkswagen",
    "model": "Golf",
    "year": 2020,
    "type": "Passenger car",
    "engineDisplacement": 1984,
    "enginePower": 110,
    "fuelType": "Diesel"
  },
  "registration": {
    "country": "RO",
    "firstRegistration": "2020-05-15",
    "lastRegistration": "2022-03-10",
    "currentOwner": {
      "type": "private",
      "since": "2022-03-10"
    }
  },
  "liens": [],
  "stolenStatus": {
    "isStolen": false,
    "checkDate": "2025-11-21"
  },
  "damageHistory": [
    {
      "date": "2023-03-15",
      "type": "Minor damage",
      "description": "Light collision repaired",
      "cost": 1500
    }
  ],
  "mileage": [
    {
      "value": 45000,
      "unit": "km",
      "date": "2023-11-01",
      "source": "Service record"
    }
  ]
}
```

**Implementation (C#):**
```csharp
public class RarService
{
    private readonly HttpClient _httpClient;
    
    public async Task<VehicleReport> GetVehicleReportAsync(string vin)
    {
        var response = await _httpClient.GetAsync($"reports/{vin}");
        
        if (!response.IsSuccessStatusCode)
            throw new ExternalServiceException("RAR/CarVertical API error");
        
        var report = await response.Content.ReadFromJsonAsync<CarVerticalReport>();
        
        return new VehicleReport
        {
            Vin = report.Vin,
            Make = report.Vehicle.Make,
            Model = report.Vehicle.Model,
            Year = report.Vehicle.Year,
            HasLiens = report.Liens?.Any() ?? false,
            IsStolen = report.StolenStatus.IsStolen,
            DamageCount = report.DamageHistory?.Count ?? 0,
            LastMileage = report.Mileage?.OrderByDescending(m => m.Date).FirstOrDefault()?.Value
        };
    }
}
```

**Pricing (CarVertical):**
- **Pay-per-report:** €5-10 per VIN check
- **Subscription:** €99/month (50 reports), €299/month (200 reports)

---

### 9.3.2. Alternative: AutoDNA

**Similar functionality, pricing €3-7 per report**

---

## 9.4. ANCPI (Cadastru și Carte Funciară)

### 9.4.1. ECRIS Portal Integration

**Status:** Nu există API public (as of 2025)

**Current workflow:**
1. Manual: Notar accesează portal ECRIS (https://ecris.ancpi.ro)
2. Login cu certificat digital
3. Solicită extras CF (introduce nr. CF)
4. Descarcă PDF (3-10 minute procesare)

**LexNotar Integration (semi-automated):**
- Button "Solicită extras CF" → Opens ECRIS portal în tab nou (pre-filled cu date)
- Notar: Login manual, confirm solicitare
- După descărcare: Upload PDF în LexNotar (drag & drop)

**Future (dacă ANCPI lansează API):**
- Fully automated: API call → Wait → Receive PDF → Auto-attach to case

---

### 9.4.2. Parsing Extras CF (OCR)

**Technology:** Tesseract OCR + Custom regex patterns

**Extract:**
- Nr. Carte Funciară
- Proprietar(i) curent(i)
- Sarcini (ipoteci, interdicții, poprituri)
- Suprafață
- Adresă imobil

**Implementation:**
```csharp
public class CadastralService
{
    private readonly ITesseractService _ocrService;
    
    public async Task<CadastralExtract> ParseExtractCfAsync(Stream pdfStream)
    {
        // Convert PDF to images
        var images = await ConvertPdfToImagesAsync(pdfStream);
        
        // OCR each page
        var texts = new List<string>();
        foreach (var image in images)
        {
            var text = await _ocrService.ExtractTextAsync(image, "ron"); // Romanian
            texts.Add(text);
        }
        
        var fullText = string.Join("\n", texts);
        
        // Parse with regex
        var cfNumber = ExtractCfNumber(fullText);
        var owners = ExtractOwners(fullText);
        var liens = ExtractLiens(fullText);
        
        return new CadastralExtract
        {
            CfNumber = cfNumber,
            Owners = owners,
            Liens = liens,
            RawText = fullText
        };
    }
    
    private string ExtractCfNumber(string text)
    {
        var match = Regex.Match(text, @"Nr\.\s*carte\s*funciara[:\s]+(\d+[-/]\w+[-/]\w+)", 
            RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : null;
    }
}
```

---

## 9.5. QES Providers (Semnătură Electronică)

### 9.5.1. Certinomis API

**Base URL:** `https://api.certinomis.com/v1`

**Authentication:** Bearer token (API key)

**Create Signing Session:**

**Endpoint:** `POST /signing-sessions`

**Request:**
```json
{
  "document": {
    "name": "Act_vanzare_Popescu_Ionescu.pdf",
    "content": "base64_encoded_pdf_content_here...",
    "mimeType": "application/pdf"
  },
  "signers": [
    {
      "name": "Popescu Ion",
      "identifierType": "ro_cnp",
      "identifier": "1800101123456",
      "email": "popescu@example.com",
      "phone": "+40722123456",
      "signaturePosition": {
        "page": 5,
        "x": 100,
        "y": 700,
        "width": 200,
        "height": 80
      }
    },
    {
      "name": "Ionescu Maria",
      "identifierType": "ro_cnp",
      "identifier": "2850202234567",
      "email": "ionescu@example.com",
      "phone": "+40733987654",
      "signaturePosition": {
        "page": 5,
        "x": 350,
        "y": 700,
        "width": 200,
        "height": 80
      }
    }
  ],
  "workflow": "sequential",
  "expiresIn": 604800,
  "callbackUrl": "https://lexnotar.ro/api/webhooks/certinomis",
  "metadata": {
    "caseId": "case_123",
    "officeId": "office_456"
  }
}
```

**Response:**
```json
{
  "sessionId": "sess_abc123def456",
  "status": "pending",
  "createdAt": "2025-11-21T10:00:00Z",
  "expiresAt": "2025-11-28T10:00:00Z",
  "signingLinks": {
    "1800101123456": "https://sign.certinomis.com/sess_abc123def456/signer1",
    "2850202234567": "https://sign.certinomis.com/sess_abc123def456/signer2"
  }
}
```

**Webhook Events:**

**1. Signer Signed:**
```json
{
  "event": "signer.signed",
  "sessionId": "sess_abc123def456",
  "signerIdentifier": "1800101123456",
  "signedAt": "2025-11-21T15:30:00Z",
  "certificateInfo": {
    "issuer": "Certinomis CA",
    "serialNumber": "CERT123456",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": "2027-01-01T00:00:00Z"
  },
  "metadata": {
    "caseId": "case_123",
    "officeId": "office_456"
  }
}
```

**2. Session Completed:**
```json
{
  "event": "session.completed",
  "sessionId": "sess_abc123def456",
  "completedAt": "2025-11-21T16:00:00Z",
  "signedDocumentUrl": "https://api.certinomis.com/v1/documents/doc_xyz789",
  "signedDocumentDownloadUrl": "https://cdn.certinomis.com/signed/doc_xyz789.pdf?token=...",
  "signatures": [
    {
      "signerIdentifier": "1800101123456",
      "signedAt": "2025-11-21T15:30:00Z",
      "certificateSerial": "CERT123456"
    },
    {
      "signerIdentifier": "2850202234567",
      "signedAt": "2025-11-21T16:00:00Z",
      "certificateSerial": "CERT789012"
    }
  ],
  "metadata": {
    "caseId": "case_123",
    "officeId": "office_456"
  }
}
```

**Implementation (C#):**
```csharp
public class CertinomisService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    
    public async Task<SigningSession> CreateSigningSessionAsync(CreateSigningSessionRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("signing-sessions", request);
        response.EnsureSuccessStatusCode();
        
        var session = await response.Content.ReadFromJsonAsync<SigningSession>();
        
        // Send signing links to signers via email/SMS
        await SendSigningInvitationsAsync(session);
        
        return session;
    }
    
    public async Task<byte[]> DownloadSignedDocumentAsync(string documentUrl)
    {
        var response = await _httpClient.GetAsync(documentUrl);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsByteArrayAsync();
    }
}

// Webhook controller
[ApiController]
[Route("api/webhooks/certinomis")]
public class CertinomisWebhookController : ControllerBase
{
    private readonly ISignatureService _signatureService;
    
    [HttpPost]
    public async Task<IActionResult> HandleWebhook([FromBody] CertinomisWebhookEvent webhookEvent)
    {
        // Verify webhook signature (HMAC)
        if (!VerifyWebhookSignature(Request))
            return Unauthorized();
        
        switch (webhookEvent.Event)
        {
            case "signer.signed":
                await _signatureService.HandleSignerSignedAsync(webhookEvent);
                break;
            
            case "session.completed":
                await _signatureService.HandleSessionCompletedAsync(webhookEvent);
                break;
            
            case "signer.rejected":
                await _signatureService.HandleSignerRejectedAsync(webhookEvent);
                break;
            
            case "session.expired":
                await _signatureService.HandleSessionExpiredAsync(webhookEvent);
                break;
        }
        
        return Ok();
    }
}
```

**Pricing (Certinomis):**
- **Setup:** Free (API integration)
- **Per signature:** €2-4 (volume discounts available)
- **Remote certificate:** €300/year per user
- **SMS OTP:** €0.05 per SMS

---

### 9.5.2. Namirial API

**Similar structure to Certinomis, alternative provider**

**Base URL:** `https://api.namirial.com/v1`

**Pricing:** €2.50-5 per signature

---

## 9.6. E-mail Service (SendGrid)

**Base URL:** `https://api.sendgrid.com/v3`

**Authentication:** Bearer token (API key)

**Send E-mail:**

**Endpoint:** `POST /mail/send`

**Request:**
```json
{
  "personalizations": [
    {
      "to": [
        {
          "email": "client@example.com",
          "name": "Popescu Ion"
        }
      ],
      "dynamic_template_data": {
        "client_name": "Popescu Ion",
        "case_number": "2025/123",
        "appointment_date": "25.11.2025",
        "appointment_time": "10:00",
        "notary_name": "Maria Popescu",
        "office_address": "Str. Exemplu nr. 1, București"
      }
    }
  ],
  "from": {
    "email": "noreply@lexnotar.ro",
    "name": "LexNotar"
  },
  "template_id": "d-123456789abcdef",
  "attachments": [
    {
      "content": "base64_encoded_pdf",
      "filename": "Factura-2025-123.pdf",
      "type": "application/pdf"
    }
  ]
}
```

**Response:**
```json
{
  "message_id": "msg_abc123"
}
```

**Pricing (SendGrid):**
- **Free tier:** 100 emails/day
- **Essentials:** $19.95/month (50,000 emails)
- **Pro:** $89.95/month (100,000 emails)

---

## 9.7. SMS Service (Twilio)

**Base URL:** `https://api.twilio.com/2010-04-01`

**Authentication:** Basic Auth (Account SID + Auth Token)

**Send SMS:**

**Endpoint:** `POST /Accounts/{AccountSid}/Messages.json`

**Request:**
```http
POST /2010-04-01/Accounts/ACxxxx/Messages.json HTTP/1.1
Host: api.twilio.com
Authorization: Basic base64(AccountSID:AuthToken)
Content-Type: application/x-www-form-urlencoded

From=+40722123456&To=+40733987654&Body=Reminder: Programare notariat maine 25.11 ora 10:00. Adresa: Str. Exemplu 1, Bucuresti
```

**Response:**
```json
{
  "sid": "SMxxxx",
  "date_created": "2025-11-21T10:00:00Z",
  "status": "queued",
  "price": null,
  "price_unit": "USD"
}
```

**Pricing (Twilio):**
- **SMS Romania:** ~$0.05 per SMS (€0.045)
- **No monthly fee** (pay-per-use)

---

## 9.8. Currency Exchange Rates (BNR)

**Base URL:** `https://www.bnr.ro`

**Endpoint:** `GET /nbrfxrates.xml`

**Response (XML):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<DataSet xmlns="http://www.bnr.ro/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.bnr.ro/xsd nbrfxrates.xsd">
  <Body>
    <Subject>Cursuri de schimb</Subject>
    <OrigCurrency>RON</OrigCurrency>
    <Cube date="2025-11-21">
      <Rate currency="AED" multiplier="1">1.3474</Rate>
      <Rate currency="AUD" multiplier="1">3.1896</Rate>
      <Rate currency="BGN" multiplier="1">2.5313</Rate>
      <Rate currency="BRL" multiplier="1">0.9156</Rate>
      <Rate currency="CAD" multiplier="1">3.4567</Rate>
      <Rate currency="CHF" multiplier="1">5.4321</Rate>
      <Rate currency="CNY" multiplier="1">0.6789</Rate>
      <Rate currency="CZK" multiplier="1">0.2012</Rate>
      <Rate currency="DKK" multiplier="1">0.6642</Rate>
      <Rate currency="EGP" multiplier="1">0.1567</Rate>
      <Rate currency="EUR" multiplier="1">4.9500</Rate>
      <Rate currency="GBP" multiplier="1">5.8765</Rate>
      <Rate currency="HRK" multiplier="1">0.6567</Rate>
      <Rate currency="HUF" multiplier="100">1.2345</Rate>
      <Rate currency="INR" multiplier="100">5.4321</Rate>
      <Rate currency="JPY" multiplier="100">3.2109</Rate>
      <Rate currency="KRW" multiplier="100">0.3456</Rate>
      <Rate currency="MDL" multiplier="1">0.2789</Rate>
      <Rate currency="MXN" multiplier="1">0.2890</Rate>
      <Rate currency="NOK" multiplier="1">0.4321</Rate>
      <Rate currency="NZD" multiplier="1">2.8901</Rate>
      <Rate currency="PLN" multiplier="1">1.1234</Rate>
      <Rate currency="RSD" multiplier="1">0.0456</Rate>
      <Rate currency="RUB" multiplier="1">0.0498</Rate>
      <Rate currency="SEK" multiplier="1">0.4567</Rate>
      <Rate currency="THB" multiplier="1">0.1345</Rate>
      <Rate currency="TRY" multiplier="1">0.1678</Rate>
      <Rate currency="UAH" multiplier="1">0.1234</Rate>
      <Rate currency="USD" multiplier="1">4.5000</Rate>
      <Rate currency="XAU" multiplier="1">12345.67</Rate>
      <Rate currency="XDR" multiplier="1">6.1234</Rate>
      <Rate currency="ZAR" multiplier="1">0.2567</Rate>
    </Cube>
  </Body>
</DataSet>
```

**Implementation (C#):**
```csharp
public class BnrService
{
    private readonly HttpClient _httpClient;
    
    public async Task<Dictionary<string, decimal>> GetExchangeRatesAsync()
    {
        var response = await _httpClient.GetStringAsync("https://www.bnr.ro/nbrfxrates.xml");
        
        var doc = XDocument.Parse(response);
        var ns = XNamespace.Get("http://www.bnr.ro/xsd");
        
        var rates = doc.Descendants(ns + "Rate")
            .ToDictionary(
                r => r.Attribute("currency")?.Value ?? "",
                r => decimal.Parse(r.Value, CultureInfo.InvariantCulture)
            );
        
        return rates;
    }
}

// Scheduled job (daily at 14:00, după publicare curs BNR)
public class ExchangeRateUpdateJob : IHostedService
{
    public async Task UpdateRatesAsync()
    {
        var rates = await _bnrService.GetExchangeRatesAsync();
        
        foreach (var rate in rates)
        {
            await _dbContext.ExchangeRates.AddAsync(new ExchangeRate
            {
                Currency = rate.Key,
                Rate = rate.Value,
                Date = DateOnly.FromDateTime(DateTime.Today)
            });
        }
        
        await _dbContext.SaveChangesAsync();
    }
}
```

---

## 9.9. Integration Health Monitoring

**Dashboard:** Admin view cu status all integrations

```csharp
public class IntegrationHealthService
{
    public async Task<List<IntegrationHealth>> CheckAllIntegrationsAsync()
    {
        var results = new List<IntegrationHealth>();
        
        // ANAF
        results.Add(await CheckAnafAsync());
        
        // ONRC (Recom)
        results.Add(await CheckOnrcAsync());
        
        // Certinomis
        results.Add(await CheckCertinomisAsync());
        
        // SendGrid
        results.Add(await CheckSendGridAsync());
        
        // Twilio
        results.Add(await CheckTwilioAsync());
        
        return results;
    }
    
    private async Task<IntegrationHealth> CheckAnafAsync()
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await _anafService.GetCompanyInfoAsync("12345678");
            sw.Stop();
            
            return new IntegrationHealth
            {
                Service = "ANAF",
                Status = sw.ElapsedMilliseconds < 3000 ? "Healthy" : "Slow",
                ResponseTime = sw.ElapsedMilliseconds,
                LastChecked = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            return new IntegrationHealth
            {
                Service = "ANAF",
                Status = "Down",
                ResponseTime = sw.ElapsedMilliseconds,
                Error = ex.Message,
                LastChecked = DateTime.UtcNow
            };
        }
    }
}
```

---

**[Next: Special Workflows →](./annex-10-special-workflows.md)**
