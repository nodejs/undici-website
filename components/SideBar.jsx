import Select from "@node-core/ui-components/Common/Select";
import SideBar from "@node-core/ui-components/Containers/Sidebar";
import styles from "@node-core/doc-kit/src/generators/web/ui/components/SideBar/index.module.css";
import { project, version, pages } from "#theme/config";
import { sidebar } from "#theme/local/site" with { type: "json" };
import versions from "../versions.json" with { type: "json" };

/** @param {string} url */
const redirect = (url) => {
  window.location.href = url;
};

const PrefetchLink = (props) => <a {...props} rel="prefetch" />;

// normalises away the "v" prefix so both compare equal.
const major = (v) => String(v.version ?? v).replace(/^v/, "").split(".")[0];

const basePath = (v) => {
  const majorVersion = major(v);
  return majorVersion === major(versions[0]) ? "/" : `/v${majorVersion}.x/`;
};

const toURL = (path) =>
  basePath(version) + path.replace(/\/index$/, "").replace(/^\/?/, "");

/**
 * Sidebar component for MDX documentation with page navigation
 */
export default ({ metadata }) => (
  <SideBar
    pathname={toURL(metadata.path)}
    groups={
      sidebar.length > 0
        ? sidebar
        : [
            {
              groupName: "Documentation",
              items: pages.map(([heading, path]) => ({
                label: heading,
                link: toURL(path),
              })),
            },
          ]
    }
    onSelect={redirect}
    as={PrefetchLink}
    title="Navigation"
  >
    <div>
      <Select
        label={`${project} version`}
        values={versions.map((v) => ({
          label: v,
          value: basePath(v),
        }))}
        inline={true}
        className={styles.select}
        placeholder={`v${version.version}`}
        onChange={redirect}
      />
    </div>
  </SideBar>
);
