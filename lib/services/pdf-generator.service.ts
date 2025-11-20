/**
 * PDF Generator Service
 * Generates PDF certificates and documents
 *
 * Note: This service provides HTML-to-PDF conversion using browser print functionality
 * For server-side PDF generation, consider using puppeteer or pdfkit in production
 */

export interface CertificateData {
  recipientName: string
  courseTitle: string
  courseCategory?: string
  courseDuration?: number
  completionDate: string
  issuedDate: string
  certificateId: string
  verificationCode: string
  instructorName: string
  instructorTitle?: string
  organizationName?: string
  organizationLogo?: string
  customMessage?: string
}

export class PDFGeneratorService {
  /**
   * Generate certificate HTML with print-ready styling
   */
  generateCertificateHTML(data: CertificateData, templateType: 'classic' | 'modern' | 'elegant' = 'modern'): string {
    const templates = {
      classic: this.generateClassicTemplate(data),
      modern: this.generateModernTemplate(data),
      elegant: this.generateElegantTemplate(data),
    }

    return templates[templateType]
  }

  /**
   * Classic template with traditional certificate design
   */
  private generateClassicTemplate(data: CertificateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }

          .certificate-container {
            width: 297mm;
            height: 210mm;
            background: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
          }

          .certificate-border {
            position: absolute;
            top: 15mm;
            left: 15mm;
            right: 15mm;
            bottom: 15mm;
            border: 3px solid #2c3e50;
            padding: 20mm;
          }

          .certificate-inner-border {
            position: absolute;
            top: 18mm;
            left: 18mm;
            right: 18mm;
            bottom: 18mm;
            border: 1px solid #2c3e50;
          }

          .certificate-content {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            z-index: 1;
          }

          .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }

          .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 8px;
            margin-bottom: 15px;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 10px;
            display: inline-block;
          }

          .certificate-subtitle {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 30px;
            font-style: italic;
          }

          .recipient-section {
            margin: 30px 0;
          }

          .certifies-text {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 15px;
          }

          .recipient-name {
            font-size: 42px;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #2c3e50;
            display: inline-block;
            min-width: 400px;
          }

          .completion-text {
            font-size: 18px;
            color: #7f8c8d;
            margin: 20px 0;
          }

          .course-name {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
          }

          .course-details {
            font-size: 16px;
            color: #7f8c8d;
            margin: 20px 0;
            line-height: 1.8;
          }

          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            width: 100%;
            max-width: 600px;
          }

          .signature-block {
            text-align: center;
            flex: 1;
          }

          .signature-line {
            border-top: 2px solid #2c3e50;
            width: 200px;
            margin: 0 auto 10px;
            height: 60px;
          }

          .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
          }

          .signature-title {
            font-size: 14px;
            color: #7f8c8d;
            font-style: italic;
          }

          .certificate-footer {
            position: absolute;
            bottom: 25mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
          }

          .verification-info {
            margin-top: 5px;
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(212, 175, 55, 0.05);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="watermark">CERTIFIED</div>
          <div class="certificate-border">
            <div class="certificate-inner-border"></div>
            <div class="certificate-content">
              ${data.organizationLogo ? `<img src="${data.organizationLogo}" alt="Logo" class="logo">` : ''}

              <div class="certificate-title">Certificate</div>
              <div class="certificate-subtitle">of Completion</div>

              <div class="recipient-section">
                <div class="certifies-text">This is to certify that</div>
                <div class="recipient-name">${data.recipientName}</div>
                <div class="completion-text">has successfully completed</div>
                <div class="course-name">${data.courseTitle}</div>
              </div>

              <div class="course-details">
                ${data.courseCategory ? `Category: ${data.courseCategory}<br>` : ''}
                ${data.courseDuration ? `Duration: ${data.courseDuration} hours<br>` : ''}
                Completion Date: ${data.completionDate}
                ${data.customMessage ? `<br><br>${data.customMessage}` : ''}
              </div>

              <div class="signatures">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">${data.instructorName}</div>
                  <div class="signature-title">${data.instructorTitle || 'Instructor'}</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">${data.organizationName || 'Civilabs LMS'}</div>
                  <div class="signature-title">Administrator</div>
                </div>
              </div>
            </div>
          </div>

          <div class="certificate-footer">
            Certificate ID: ${data.certificateId}<br>
            <span class="verification-info">Verification Code: ${data.verificationCode} | Issued: ${data.issuedDate}</span>
          </div>
        </div>

        <script>
          // Auto-print functionality for browsers
          window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === 'true') {
              window.print();
            }
          };
        </script>
      </body>
      </html>
    `
  }

  /**
   * Modern template with contemporary design
   */
  private generateModernTemplate(data: CertificateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Helvetica Neue', 'Arial', sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }

          .certificate-container {
            width: 297mm;
            height: 210mm;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0,0,0,0.2);
          }

          .certificate-content-wrapper {
            position: absolute;
            top: 20mm;
            left: 20mm;
            right: 20mm;
            bottom: 20mm;
            background: white;
            border-radius: 10px;
            padding: 40mm 30mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .accent-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
          }

          .logo {
            width: 70px;
            height: 70px;
            margin-bottom: 20px;
          }

          .certificate-title {
            font-size: 52px;
            font-weight: 700;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 10px;
          }

          .certificate-subtitle {
            font-size: 22px;
            color: #764ba2;
            margin-bottom: 40px;
            font-weight: 300;
          }

          .certifies-text {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
          }

          .recipient-name {
            font-size: 48px;
            font-weight: 700;
            color: #333;
            margin: 20px 0;
            padding-bottom: 15px;
            border-bottom: 4px solid #667eea;
            display: inline-block;
            min-width: 450px;
          }

          .completion-text {
            font-size: 18px;
            color: #666;
            margin: 30px 0 20px;
          }

          .course-name {
            font-size: 36px;
            font-weight: 600;
            color: #764ba2;
            margin: 20px 0;
          }

          .course-details {
            font-size: 16px;
            color: #888;
            margin: 25px 0;
            line-height: 1.8;
          }

          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 50px;
            width: 100%;
            max-width: 600px;
          }

          .signature-block {
            text-align: center;
          }

          .signature-line {
            border-top: 2px solid #667eea;
            width: 200px;
            margin: 0 auto 10px;
            height: 50px;
          }

          .signature-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .signature-title {
            font-size: 14px;
            color: #888;
          }

          .certificate-footer {
            position: absolute;
            bottom: 15mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 11px;
            color: #999;
          }

          .decorative-corner {
            position: absolute;
            width: 100px;
            height: 100px;
            opacity: 0.1;
          }

          .corner-tl {
            top: 0;
            left: 0;
            border-top: 50px solid #667eea;
            border-right: 50px solid transparent;
          }

          .corner-br {
            bottom: 0;
            right: 0;
            border-bottom: 50px solid #764ba2;
            border-left: 50px solid transparent;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="certificate-content-wrapper">
            <div class="accent-bar"></div>
            <div class="decorative-corner corner-tl"></div>
            <div class="decorative-corner corner-br"></div>

            ${data.organizationLogo ? `<img src="${data.organizationLogo}" alt="Logo" class="logo">` : ''}

            <div class="certificate-title">Certificate</div>
            <div class="certificate-subtitle">of Achievement</div>

            <div class="certifies-text">This certifies that</div>
            <div class="recipient-name">${data.recipientName}</div>
            <div class="completion-text">has successfully completed the course</div>
            <div class="course-name">${data.courseTitle}</div>

            <div class="course-details">
              ${data.courseCategory ? `${data.courseCategory} • ` : ''}
              ${data.courseDuration ? `${data.courseDuration} hours • ` : ''}
              Completed on ${data.completionDate}
              ${data.customMessage ? `<br><br>${data.customMessage}` : ''}
            </div>

            <div class="signatures">
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">${data.instructorName}</div>
                <div class="signature-title">${data.instructorTitle || 'Course Instructor'}</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">${data.organizationName || 'Civilabs LMS'}</div>
                <div class="signature-title">Program Administrator</div>
              </div>
            </div>

            <div class="certificate-footer">
              ID: ${data.certificateId} | Verification: ${data.verificationCode} | Issued: ${data.issuedDate}
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === 'true') {
              window.print();
            }
          };
        </script>
      </body>
      </html>
    `
  }

  /**
   * Elegant template with refined design
   */
  private generateElegantTemplate(data: CertificateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Excellence</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Palatino', 'Book Antiqua', serif;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }

          .certificate-container {
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 50px rgba(0,0,0,0.15);
          }

          .ornamental-border {
            position: absolute;
            top: 12mm;
            left: 12mm;
            right: 12mm;
            bottom: 12mm;
            border: 2px solid #c9a961;
            background-image:
              linear-gradient(to right, #c9a961 2px, transparent 2px),
              linear-gradient(to bottom, #c9a961 2px, transparent 2px);
            background-size: 20px 20px;
            background-position: -2px -2px;
            opacity: 0.3;
          }

          .inner-border {
            position: absolute;
            top: 15mm;
            left: 15mm;
            right: 15mm;
            bottom: 15mm;
            border: 1px solid #c9a961;
          }

          .certificate-content {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            z-index: 1;
            padding: 30mm;
          }

          .seal {
            position: absolute;
            bottom: 25mm;
            left: 25mm;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid #c9a961;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #c9a961;
            font-weight: bold;
            background: white;
          }

          .logo {
            width: 60px;
            height: 60px;
            margin-bottom: 25px;
          }

          .certificate-title {
            font-size: 56px;
            font-weight: 300;
            color: #2c3e50;
            font-style: italic;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }

          .certificate-subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 45px;
            text-transform: uppercase;
            letter-spacing: 4px;
            border-bottom: 1px solid #c9a961;
            padding-bottom: 10px;
            display: inline-block;
          }

          .certifies-text {
            font-size: 16px;
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 15px;
          }

          .recipient-name {
            font-size: 44px;
            font-weight: 400;
            color: #c9a961;
            margin: 25px 0;
            font-style: italic;
            position: relative;
            display: inline-block;
          }

          .recipient-name::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 1px;
            background: #c9a961;
          }

          .completion-text {
            font-size: 16px;
            color: #7f8c8d;
            margin: 35px 0 20px;
            font-style: italic;
          }

          .course-name {
            font-size: 32px;
            font-weight: 500;
            color: #2c3e50;
            margin: 20px 0;
          }

          .course-details {
            font-size: 14px;
            color: #95a5a6;
            margin: 25px 0;
            line-height: 2;
          }

          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 55px;
            width: 100%;
            max-width: 550px;
          }

          .signature-block {
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #2c3e50;
            width: 180px;
            margin: 0 auto 12px;
            height: 45px;
          }

          .signature-name {
            font-size: 15px;
            font-weight: 500;
            color: #2c3e50;
            font-style: italic;
          }

          .signature-title {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 3px;
          }

          .certificate-footer {
            position: absolute;
            bottom: 18mm;
            right: 25mm;
            text-align: right;
            font-size: 10px;
            color: #bdc3c7;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="ornamental-border"></div>
          <div class="inner-border"></div>
          <div class="seal">CERTIFIED<br>COMPLETION</div>

          <div class="certificate-content">
            ${data.organizationLogo ? `<img src="${data.organizationLogo}" alt="Logo" class="logo">` : ''}

            <div class="certificate-title">Certificate</div>
            <div class="certificate-subtitle">of Excellence</div>

            <div class="certifies-text">is hereby awarded to</div>
            <div class="recipient-name">${data.recipientName}</div>
            <div class="completion-text">for outstanding achievement in completing</div>
            <div class="course-name">${data.courseTitle}</div>

            <div class="course-details">
              ${data.courseCategory ? `${data.courseCategory}<br>` : ''}
              ${data.courseDuration ? `Program Duration: ${data.courseDuration} hours<br>` : ''}
              Completed: ${data.completionDate}
              ${data.customMessage ? `<br><br><em>${data.customMessage}</em>` : ''}
            </div>

            <div class="signatures">
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">${data.instructorName}</div>
                <div class="signature-title">${data.instructorTitle || 'Course Instructor'}</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">${data.organizationName || 'Civilabs LMS'}</div>
                <div class="signature-title">Certifying Authority</div>
              </div>
            </div>
          </div>

          <div class="certificate-footer">
            Certificate No. ${data.certificateId}<br>
            Verification Code: ${data.verificationCode}<br>
            Issue Date: ${data.issuedDate}
          </div>
        </div>

        <script>
          window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === 'true') {
              window.print();
            }
          };
        </script>
      </body>
      </html>
    `
  }

  /**
   * Format date for certificate display
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

export const pdfGeneratorService = new PDFGeneratorService()
export default pdfGeneratorService
