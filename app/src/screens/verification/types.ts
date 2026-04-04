export interface VerificationDraft {
  governmentIdUri?: string;
  businessName?: string;
  businessLicenseNumber?: string;
}

export type VerificationFlowParamList = {
  UploadId: { draft?: VerificationDraft };
  BusinessDetails: { draft: VerificationDraft };
  ReviewSubmit: { draft: VerificationDraft };
};
