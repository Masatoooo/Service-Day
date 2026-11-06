// Model: a partner NGO that offers volunteering activities.
export interface Ngo {
  id: string;
  name: string;
  /** e.g. 'Food security' */
  focusArea: string;
  description: string;
  contactName: string;
  contactEmail: string;
  verified: boolean;
}
