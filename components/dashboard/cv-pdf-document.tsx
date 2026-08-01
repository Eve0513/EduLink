"use client";

import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { GeneratedCV } from "@/lib/ai/generate-cv-prompt";

// Helvetica omits Romanian glyphs. The Unicode font is shipped with EduLink so
// every downloaded PDF preserves diacritics independently of the device.
// React-PDF runs in the browser for PDFDownloadLink and can also run in Node
// during server-side generation, where the static URL is not a filesystem path.
const unicodeFontSource = typeof window === "undefined"
  ? `${process.cwd()}/public/fonts/DejaVuSans.ttf`
  : "/fonts/DejaVuSans.ttf";

Font.register({ family: "EduLink Unicode", src: unicodeFontSource });

const colors = {
  ink: "#0f172a",
  muted: "#475569",
  teal: "#0e5e6f",
  line: "#cbd5e1",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 42,
    paddingBottom: 42,
    fontFamily: "EduLink Unicode",
    color: colors.ink,
    fontSize: 9.5,
    lineHeight: 1.45,
  },
  name: { color: colors.teal, fontSize: 20, letterSpacing: 0.2, lineHeight: 1.15 },
  role: { fontSize: 10.5, marginTop: 5 },
  contact: { color: colors.muted, fontSize: 8.5, marginTop: 6 },
  divider: { borderBottomColor: colors.teal, borderBottomWidth: 2, marginTop: 12 },
  section: { marginTop: 14 },
  sectionTitle: { color: colors.teal, fontSize: 10, letterSpacing: 0.8, marginBottom: 5, textTransform: "uppercase" },
  body: { color: colors.ink, fontSize: 9.3, lineHeight: 1.45 },
  entry: { marginBottom: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  entryTitle: { fontSize: 9.7, flexGrow: 1 },
  dates: { color: colors.muted, fontSize: 8.3 },
  metadata: { color: colors.muted, fontSize: 8.4, marginTop: 1 },
  bullet: { flexDirection: "row", gap: 5, marginTop: 2 },
  bulletMark: { color: colors.teal },
  bulletText: { flexGrow: 1, fontSize: 9.1 },
  skills: { color: colors.ink, fontSize: 9.1, lineHeight: 1.6 },
  link: { color: colors.teal, fontFamily: "EduLink Unicode", fontSize: 8.4, marginTop: 2, textDecoration: "underline" },
  footer: {
    bottom: 22,
    color: colors.muted,
    fontSize: 7.5,
    left: 42,
    position: "absolute",
    right: 42,
    textAlign: "center",
  },
});

function displayDate(value: string | null) {
  if (!value) return "Prezent";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function dateRange(start: string, end: string | null) {
  return `${displayDate(start)} – ${displayDate(end)}`;
}

function nonEmpty(values: Array<string | null>) {
  return values.filter((value): value is string => Boolean(value?.trim()));
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bullet}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function CertificateReference({ value }: { value: string }) {
  return /^https?:\/\//i.test(value)
    ? <Link src={value} style={styles.link}>Verifică acreditarea</Link>
    : <Text style={styles.metadata}>ID acreditare: {value}</Text>;
}

export function CVPdfDocument({ cv }: { cv: GeneratedCV }) {
  const contact = nonEmpty([
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.contact_link,
  ]).join(" | ");

  return (
    <Document title={`CV - ${cv.contact.full_name}`} author="EduLink">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{cv.contact.full_name}</Text>
        <Text style={styles.role}>{cv.target_role_inferred}</Text>
        {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        <View style={styles.divider} />

        {cv.professional_summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil profesional</Text>
            <Text style={styles.body}>{cv.professional_summary}</Text>
          </View>
        ) : null}

        {cv.experience.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiență</Text>
            {cv.experience.map((experience, index) => (
              <View key={`${experience.job_title}-${index}`} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{experience.job_title}</Text>
                  <Text style={styles.dates}>{dateRange(experience.start_date, experience.end_date)}</Text>
                </View>
                <Text style={styles.metadata}>
                  {nonEmpty([experience.organization_name, experience.employment_type, experience.location]).join(" | ")}
                </Text>
                <BulletList items={experience.bullets} />
              </View>
            ))}
          </View>
        ) : null}

        {cv.education.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educație</Text>
            {cv.education.map((education, index) => (
              <View key={`${education.institution_name}-${index}`} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{education.institution_name}</Text>
                  <Text style={styles.dates}>{dateRange(education.start_date, education.end_date)}</Text>
                </View>
                <Text style={styles.metadata}>
                  {nonEmpty([education.degree_level, education.field_of_study]).join(" | ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {cv.projects.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proiecte</Text>
            {cv.projects.map((project, index) => (
              <View key={`${project.title}-${index}`} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{project.title}</Text>
                {project.technologies.length ? <Text style={styles.metadata}>{project.technologies.join(" | ")}</Text> : null}
                <BulletList items={project.description_bullets} />
                {project.live_url ? <Link src={project.live_url} style={styles.link}>{project.live_url}</Link> : null}
                {!project.live_url && project.repo_url ? <Link src={project.repo_url} style={styles.link}>{project.repo_url}</Link> : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.certificates.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificări</Text>
            {cv.certificates.map((certificate, index) => (
              <View key={`${certificate.title}-${index}`} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{certificate.title}</Text>
                <Text style={styles.metadata}>
                  {nonEmpty([certificate.issuing_organization, certificate.date_issued]).join(" | ")}
                </Text>
                {certificate.credential_id ? <CertificateReference value={certificate.credential_id} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.skills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Competențe</Text>
            <Text style={styles.skills}>{cv.skills.map((skill) => `${skill.name} (${skill.level})`).join(" | ")}</Text>
          </View>
        ) : null}

        <Text fixed style={styles.footer}>
          Generat de EduLink pe baza informațiilor confirmate în profil. Verifică datele înainte de distribuire.
        </Text>
      </Page>
    </Document>
  );
}
