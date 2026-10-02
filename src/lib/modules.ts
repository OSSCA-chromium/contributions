import taxonomy from '@/lib/module-taxonomy.json';

export type ContributionModule = keyof typeof taxonomy;

export function getModuleLabel(module: string): string {
  return Object.prototype.hasOwnProperty.call(taxonomy, module)
    ? taxonomy[module as ContributionModule].label
    : module;
}
