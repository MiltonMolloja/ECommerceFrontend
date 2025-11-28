# Generate self-signed SSL certificate for localhost development
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(5) -KeyAlgorithm RSA -KeyLength 2048

# Export as PFX
$pwd = ConvertTo-SecureString -String "localhost" -Force -AsPlainText
$pfxPath = "C:\Source\ECommerceFrontend\ssl\localhost.pfx"
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath $pfxPath -Password $pwd

# Export as PEM (certificate)
$pemCertPath = "C:\Source\ECommerceFrontend\ssl\localhost.crt"
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
[System.IO.File]::WriteAllBytes($pemCertPath, $certBytes)

Write-Host "Certificate generated successfully!"
Write-Host "Thumbprint: $($cert.Thumbprint)"
Write-Host "PFX file: $pfxPath"
Write-Host "CRT file: $pemCertPath"
Write-Host ""
Write-Host "Now extracting private key from PFX to PEM format..."

# Convert PFX to PEM using OpenSSL (if available)
$opensslPath = (Get-Command openssl -ErrorAction SilentlyContinue).Source
if ($opensslPath) {
    & openssl pkcs12 -in $pfxPath -nocerts -out "C:\Source\ECommerceFrontend\ssl\localhost.key" -nodes -passin pass:localhost
    Write-Host "Private key exported to: C:\Source\ECommerceFrontend\ssl\localhost.key"
} else {
    Write-Host "OpenSSL not found. You may need to manually extract the private key."
    Write-Host "Alternatively, Angular can work with just the PFX file."
}

Write-Host ""
Write-Host "Certificate installation:"
Write-Host "To trust this certificate, double-click localhost.crt and install it to 'Trusted Root Certification Authorities'"
