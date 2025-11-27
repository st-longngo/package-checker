export interface AffectedPackage {
  package_name: string;
  version: string;
}

export interface AffectedPackagesData {
  crawled_at: string;
  total_packages: number;
  source_url: string;
  packages: AffectedPackage[];
}

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

export interface AffectedPackageResult {
  packageName: string;
  installedVersion: string;
  affectedVersions: string[];
  isDependency: boolean;
  isDevDependency: boolean;
}

export interface CheckResult {
  totalPackages: number;
  affectedPackages: AffectedPackageResult[];
  safePackages: number;
}
