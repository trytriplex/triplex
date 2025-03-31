/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

// @ts-ignore
import forge from "node-forge/lib/forge";
// @ts-ignore
import "node-forge/lib/pki";

// a hexString is considered negative if it's most significant bit is 1
// because serial numbers use ones' complement notation
// this RFC in section 4.1.2.2 requires serial numbers to be positive
// http://www.ietf.org/rfc/rfc5280.txt
function toPositiveHex(hexString: string) {
  let mostSignificativeHexAsInt = Number.parseInt(hexString[0], 16);
  if (mostSignificativeHexAsInt < 8) {
    return hexString;
  }

  mostSignificativeHexAsInt -= 8;
  return mostSignificativeHexAsInt.toString() + hexString.slice(1);
}

export function createCertificate(
  name: string = "example.org",
  domains?: string[],
): string {
  const days = 30;
  const keySize = 2048;

  const appendDomains = domains
    ? domains.map((item) => ({ type: 2, value: item }))
    : [];

  const extensions = [
    {
      dataEncipherment: true,
      digitalSignature: true,
      keyCertSign: true,
      keyEncipherment: true,
      name: "keyUsage",
      nonRepudiation: true,
    },
    {
      clientAuth: true,
      codeSigning: true,
      name: "extKeyUsage",
      serverAuth: true,
      timeStamping: true,
    },
    {
      altNames: [
        {
          // type 2 is DNS
          type: 2,
          value: "localhost",
        },
        {
          type: 2,
          value: "[::1]",
        },
        {
          ip: "127.0.0.1",
          // type 7 is IP
          type: 7,
        },
        {
          ip: "fe80::1",
          type: 7,
        },
        ...appendDomains,
      ],
      name: "subjectAltName",
    },
  ];

  const attrs = [
    {
      name: "commonName",
      value: name,
    },
    {
      name: "countryName",
      value: "US",
    },
    {
      shortName: "ST",
      value: "Virginia",
    },
    {
      name: "localityName",
      value: "Blacksburg",
    },
    {
      name: "organizationName",
      value: "Test",
    },
    {
      shortName: "OU",
      value: "Test",
    },
  ];

  const keyPair = forge.pki.rsa.generateKeyPair(keySize);

  const cert = forge.pki.createCertificate();

  cert.serialNumber = toPositiveHex(
    forge.util.bytesToHex(forge.random.getBytesSync(9)),
  ); // the serial number can be decimal or hex (if preceded by 0x)

  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + days);

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  cert.publicKey = keyPair.publicKey;

  cert.setExtensions(extensions);

  const algorithm = forge.md.sha256.create();
  cert.sign(keyPair.privateKey, algorithm);

  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
  const certPem = forge.pki.certificateToPem(cert);

  return privateKeyPem + certPem;
}
