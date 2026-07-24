import { useRouter } from "expo-router";

import { ResidentPopOutScreen } from "@/features/resident/shared/resident-overlays";
import { getResidentBillsFeature, type ResidentBillsFeatureId } from "./resident-bills-feature-catalog";
import { residentBillsFixture } from "./resident-bills-fixtures";

export function ResidentBillsFeatureScreen({ featureId }: { featureId: ResidentBillsFeatureId }) {
  const feature = getResidentBillsFeature(featureId);
  const router = useRouter();

  return (
    <ResidentPopOutScreen
      description={feature.description}
      eyebrow="REMANAGE BILLS"
      highlights={feature.highlights}
      icon={feature.icon}
      notice="This is a guided mobile preview; it does not initiate a live payment."
      noticeTone="warning"
      onBack={() => router.back()}
      secondaryLabel="Back to Bills"
      title={feature.title}
    />
  );
}

export function ResidentBillInvoiceScreen() {
  const router = useRouter();
  const invoice = residentBillsFixture.latestInvoice;

  return (
    <ResidentPopOutScreen
      description={`${invoice.period} · ${invoice.dueDate}`}
      eyebrow="AMOUNT DUE"
      highlights={[
        invoice.title,
        `Amount ${invoice.amount}`,
        "This preview keeps the invoice visible without creating a payment or receipt.",
      ]}
      icon="document"
      onBack={() => router.back()}
      secondaryLabel="Back to Bills"
      title={invoice.title}
    />
  );
}
