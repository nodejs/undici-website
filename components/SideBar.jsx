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

const basePath = (v) => (v === versions[0] ? "/" : `/${v.split(".")[0]}.x/`);

/**
 * Sidebar component for MDX documentation with page navigation
 */
export default ({ metadata }) => (
  <SideBar
    pathname={metadata.path.replace("/index", "")}
    groups={
      sidebar.length > 0
        ? sidebar
        : [
            {
              groupName: "Documentation",
              items: pages.map(([heading, path]) => ({
                label: heading,
                link: basePath(version.version) + path.replace(/^\/?/, ""),
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
