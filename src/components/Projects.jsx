import { useEffect, useMemo, useState, Fragment } from "react";
import { IoStar } from "react-icons/io5";
import { projects } from "@datapack/projects";
import { companies } from "@datapack/experience";
import { schools } from "@datapack/education";
import { skills, categories, getSkillCategoryId } from "@datapack/skills";
import { publications } from "@datapack/publications";
import ProjectCard from "./ProjectCard";
import FilterDropdown from "./FilterDropdown";
import FilterChips from "./FilterChips";
import FilterPanel from "./FilterPanel";
import Icon from "./Icon";
import { getSectionTheme } from "../config/sections";
import { hasRelatedPublicationsForProject } from "../utils/projectPublications";
import { getEarliestStart, getLatestEnd } from "../utils/dateFormat";

export default function Projects({ focusedSkill, setFocusedSkill, focusedCompany, setFocusedCompany, focusedActivity, setFocusedActivity, focusedProjectFilters, setFocusedProjectFilters, focusedAcademic, setFocusedAcademic, isActive, onProjectClick }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const [selectedProfessional, setSelectedProfessional] = useState([]);
  const [selectedAcademic, setSelectedAcademic] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [personalSelected, setPersonalSelected] = useState(false);
  const [featuredSelected, setFeaturedSelected] = useState(true);

  // Wrapped setters: enabling any filter disables Featured
  const wrappedSetSelectedProfessional = (valueOrUpdater) => {
    setSelectedProfessional((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (Array.isArray(next) && next.length > 0) setFeaturedSelected(false);
      return next;
    });
  };

  const wrappedSetSelectedAcademic = (valueOrUpdater) => {
    setSelectedAcademic((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (Array.isArray(next) && next.length > 0) setFeaturedSelected(false);
      return next;
    });
  };

  const wrappedSetSelectedSkills = (valueOrUpdater) => {
    setSelectedSkills((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (Array.isArray(next) && next.length > 0) setFeaturedSelected(false);
      return next;
    });
  };

  const wrappedSetPersonal = (valueOrUpdater) => {
    setPersonalSelected((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (next) setFeaturedSelected(false);
      return next;
    });
  };

  const baseProjects = useMemo(
    () => featuredSelected ? projects.filter((project) => project.tags.includes("featured")) : projects,
    [featuredSelected]
  );

  // 🔥 Apply skill from Skills section
  useEffect(() => {
    if (focusedSkill) {
      // Reset other filters and set only the focused skill
      setSelectedProfessional([]);
      setSelectedAcademic([]);
      setPersonalSelected(false);
      setFeaturedSelected(false);
      setOpenDropdown(null);
      setSelectedSkills([focusedSkill]);
      setFocusedCompany(null);
      setFocusedActivity(null);
      const section = document.getElementById("projects");
      section?.scrollIntoView({ behavior: "smooth" });
      setFocusedSkill(null);
    }
  }, [focusedSkill]);


  // 🔥 Apply company from Experience section
  useEffect(() => {
    if (focusedCompany) {
      setSelectedProfessional([focusedCompany]);
      setSelectedSkills([]);
      setSelectedAcademic([]);
      setPersonalSelected(false);
      setFeaturedSelected(false);
      setFocusedSkill(null);
      setFocusedActivity(null);
      const section = document.getElementById("projects");
      section?.scrollIntoView({ behavior: "smooth" });
      setFocusedCompany(null);
    }
  }, [focusedCompany]);

  // 🔥 Apply school from Education section
  useEffect(() => {
    if (focusedAcademic) {
      setSelectedAcademic([focusedAcademic]);
      setSelectedSkills([]);
      setSelectedProfessional([]);
      setPersonalSelected(false);
      setFeaturedSelected(false);
      setFocusedSkill(null);
      setFocusedActivity(null);
      const section = document.getElementById("projects");
      section?.scrollIntoView({ behavior: "smooth" });
      setFocusedAcademic(null);
    }
  }, [focusedAcademic]);

  useEffect(() => {
    if (!Array.isArray(focusedProjectFilters) || focusedProjectFilters.length === 0) {
      return;
    }

    setSelectedProfessional(
      focusedProjectFilters.filter((filter) =>
        companies.some((company) => company.id === filter)
      )
    );
    setSelectedAcademic(
      focusedProjectFilters.filter((filter) =>
        schools.some((school) => school.id === filter)
      )
    );
    setSelectedSkills(
      focusedProjectFilters.filter((filter) =>
        skills.some((skill) => skill.id === filter)
      )
    );
    setPersonalSelected(focusedProjectFilters.includes("personal"));
    // Featured only when the filters include only `featured` and nothing else
    const hasOther = focusedProjectFilters.some((f) => f !== "featured");
    setFeaturedSelected(focusedProjectFilters.includes("featured") && !hasOther);
    setOpenDropdown(null);
    setFocusedSkill(null);
    setFocusedCompany(null);
    setFocusedActivity(null);
    setFocusedAcademic(null);
    const section = document.getElementById("projects");
    section?.scrollIntoView({ behavior: "smooth" });
    setFocusedProjectFilters(null);
  }, [focusedProjectFilters, setFocusedActivity, setFocusedAcademic, setFocusedCompany, setFocusedProjectFilters, setFocusedSkill]);

  // 🔥 Apply activity from Activities section
  useEffect(() => {
    if (focusedActivity) {
      setSelectedProfessional([]);
      setSelectedSkills([]);
      setSelectedAcademic([]);
      setPersonalSelected(false);
      setFeaturedSelected(false);
      setFocusedSkill(null);
      setFocusedCompany(null);
      // Try to filter by activity tag
      setOpenDropdown(null);
      // Not all activities are tags, but if present, filter
      // (projects may use activity title as tag)
      // This will filter by activity tag if present
      setSelectedSkills([]);
      setSelectedProfessional([]);
      setSelectedAcademic([]);
      setPersonalSelected(false);
      // Add activity tag to selectedOrigins
      setSelectedProfessional([]);
      setSelectedAcademic([]);
      setSelectedSkills([]);
      setPersonalSelected(false);
      // Use selectedProfessional for activityTitle
      setSelectedProfessional([focusedActivity]);
      const section = document.getElementById("projects");
      section?.scrollIntoView({ behavior: "smooth" });
      setFocusedActivity(null);
    }
  }, [focusedActivity]);

  const toggleInList = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const clearAll = () => {
    setSelectedProfessional([]);
    setSelectedAcademic([]);
    setSelectedSkills([]);
    setPersonalSelected(false);
    setFeaturedSelected(false);
    setOpenDropdown(null);
  };

  const selectedOrigins = [
    ...selectedProfessional,
    ...selectedAcademic,
    ...(personalSelected ? ["personal"] : []),
  ];

  const filteredProjects = baseProjects.filter((p) => {
    const originMatch =
      selectedOrigins.length === 0 ||
      p.tags.some((t) => selectedOrigins.includes(t));

    const skillMatch =
      selectedSkills.length === 0 ||
      p.tags.some((t) => selectedSkills.includes(t));

    return originMatch && skillMatch;
  });

  const activeProfessional = companies.filter((c) =>
    selectedProfessional.includes(c.id)
  );
  const activeAcademic = schools.filter((s) =>
    selectedAcademic.includes(s.id)
  );
  const activeSkills = skills.filter((s) =>
    selectedSkills.includes(s.id)
  );

  const skillOrder = categories.map((c) => c.id);
  const skillLabels = Object.fromEntries(categories.map((c) => [c.id, c.title]));

  const companiesWithProjects = useMemo(() =>
    companies.filter((c) => projects.some((p) => p.tags.includes(c.id))),
  []);

  const schoolsWithProjects = useMemo(() =>
    schools.filter((s) => projects.some((p) => p.tags.includes(s.id))),
  []);

  const hasPersonalProjects = useMemo(() =>
    projects.some((p) => p.tags.includes("personal")),
  []);

  const skillGroups = useMemo(() => {
    const skillsWithProjects = skills.filter((skill) =>
      projects.some((p) => p.tags.includes(skill.id))
    );
    return skillsWithProjects.reduce((acc, skill) => {
      const type = getSkillCategoryId(skill);
      if (!acc[type]) acc[type] = [];
      acc[type].push(skill);
      return acc;
    }, {});
  }, []);

  const chips = {
    featured: featuredSelected,
    professional: activeProfessional,
    academic: activeAcademic,
    personal: personalSelected,
    skills: activeSkills,
    onRemoveFeatured: () => setFeaturedSelected(false),
    onRemoveProfessional: (id) =>
      setSelectedProfessional((p) => p.filter((v) => v !== id)),
    onRemoveAcademic: (id) =>
      setSelectedAcademic((p) => p.filter((v) => v !== id)),
    onRemovePersonal: () => setPersonalSelected(false),
    onRemoveSkill: (id) =>
      setSelectedSkills((p) => p.filter((v) => v !== id)),
  };


  // Cap to 2 rows (16 icons max), keep category order, remove non-featured most common first
  const renderProjectSkills = (project) => {
    const projectSkills = project.tags
      .map((tag) => skills.find((s) => s.id === tag))
      .filter(Boolean);

    // Group by category, preserve order
    const grouped = skillOrder.map((catId) =>
      (projectSkills.filter((s) => getSkillCategoryId(s) === catId))
    );
    let ordered = grouped.flat().filter(Boolean);

    // If <= 16, return as is
    if (ordered.length <= 16) return ordered;

    // Split featured/non-featured
    const isFeatured = (skill) => Array.isArray(skill.tags) && skill.tags.includes("featured");
    const featured = ordered.filter(isFeatured);
    let nonFeatured = ordered.filter((s) => !isFeatured(s));

    // Sort non-featured by commonality (most common first)
    nonFeatured = nonFeatured.slice().sort((a, b) => {
      const freqA = projects.filter((p) => p.tags.includes(a.id)).length;
      const freqB = projects.filter((p) => p.tags.includes(b.id)).length;
      return freqB - freqA;
    });

    // Remove most common non-featured until total is 16
    let keep = [...featured];
    for (const skill of nonFeatured.reverse()) {
      keep.push(skill);
      if (keep.length === 16) break;
    }

    // Resort by category order
    const keepSet = new Set(keep.map((s) => s.id));
    return grouped.flat().filter((s) => keepSet.has(s.id));
  };

  const hasAnyFilter =
    featuredSelected ||
    selectedProfessional.length > 0 ||
    selectedAcademic.length > 0 ||
    selectedSkills.length > 0 ||
    personalSelected;
  const hasOtherFilters =
    selectedProfessional.length > 0 ||
    selectedAcademic.length > 0 ||
    selectedSkills.length > 0 ||
    personalSelected;
  const featuredProjectCount = projects.filter((project) => project.tags.includes("featured")).length;

  return (
    <section id="projects" className="py-16">
      {/* Sticky header and filter bar */}
      <div
        className="sticky top-12 lg:top-0 z-40 backdrop-blur border-b mb-6 relative transition-colors duration-300"
        style={{
          backgroundColor: isActive ? 'var(--section-active-bg)' : 'var(--section-base-bg)',
          borderBottomColor: isActive ? getSectionTheme("projects").accentBorder : getSectionTheme("projects").controlBorder
        }}
      >
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{ backgroundColor: isActive ? 'var(--section-sticky-overlay)' : 'transparent' }}
        />
        <div className="relative pt-4">
          <h2 className="text-3xl font-bold mb-2">Projects</h2>
          {/* FILTER BAR */}
          <FilterPanel
            leadingControls={[
              {
                id: "projects-featured",
                label: <span className="flex items-center gap-1.5"><IoStar size={14} className="opacity-60" />Featured</span>,
                active: featuredSelected,
                onClick: () => setFeaturedSelected((value) => {
                  const next = !value;
                  if (next) {
                    // enabling Featured clears all other filters
                    setSelectedProfessional([]);
                    setSelectedAcademic([]);
                    setSelectedSkills([]);
                    setPersonalSelected(false);
                    setOpenDropdown(null);
                  }
                  return next;
                }),
              },
            ]}
            filters={[
              {
                id: "prof",
                label: "Professional",
                group: "associations",
                items: companiesWithProjects,
                selected: selectedProfessional,
                setSelected: wrappedSetSelectedProfessional,
              },
              {
                id: "acad",
                label: "Academic",
                group: "associations",
                items: schoolsWithProjects,
                selected: selectedAcademic,
                setSelected: wrappedSetSelectedAcademic,
              },
              {
                id: "skills",
                label: "Skills",
                group: "skills",
                grouped: skillGroups,
                order: skillOrder,
                labels: skillLabels,
                selected: selectedSkills,
                setSelected: wrappedSetSelectedSkills,
              },
            ]}
            personal={hasPersonalProjects ? {
              value: personalSelected,
              setValue: wrappedSetPersonal,
            } : null}
            onClearAll={clearAll}
            chips={chips}
          />
        </div>
      </div>

      {/* PROJECTS */}
      {(() => {
        const onlyAcademic =
          selectedAcademic.length > 0 &&
          selectedProfessional.length === 0 &&
          !personalSelected;

        if (onlyAcademic) {
          // When multiple schools are selected, group school-by-school then by year within each school.
          // The first year delimiter of each school carries that school's label.
          const groups = [];

          if (selectedAcademic.length > 1) {
            activeAcademic.forEach((school) => {
              const schoolProjects = filteredProjects.filter((p) => p.tags.includes(school.id));
              let firstForSchool = true;
              let lastSeenYear = null;
              schoolProjects.forEach((project) => {
                const yr = project.year ?? null;
                // If year-less but we've already seen a year, fold into current group
                const effectiveYr = (yr === null && lastSeenYear !== null) ? lastSeenYear : yr;
                if (yr !== null) lastSeenYear = yr;
                const last = groups[groups.length - 1];
                // Check if this year already appeared in an earlier group (for this school scope)
                const existing = effectiveYr !== null
                  ? groups.find((g) => g.year === effectiveYr && (g.schoolLabel === (school.label ?? school.title) || (!firstForSchool && g.schoolLabel === null)))
                  : null;
                if (!firstForSchool && existing) {
                  existing.projects.push(project);
                } else if (last && last.year === effectiveYr && !firstForSchool) {
                  last.projects.push(project);
                } else {
                  groups.push({
                    year: effectiveYr,
                    projects: [project],
                    schoolLabel: firstForSchool ? (school.label ?? school.title) : null,
                  });
                  firstForSchool = false;
                }
              });
            });
          } else {
            // Single school: group by year only
            let lastSeenYear = null;
            filteredProjects.forEach((project) => {
              const yr = project.year ?? null;
              const effectiveYr = (yr === null && lastSeenYear !== null) ? lastSeenYear : yr;
              if (yr !== null) lastSeenYear = yr;
              // If this year already appeared in an earlier group, push into it
              const existing = effectiveYr !== null ? groups.find((g) => g.year === effectiveYr) : null;
              if (existing) {
                existing.projects.push(project);
              } else {
                groups.push({ year: effectiveYr, projects: [project], schoolLabel: null });
              }
            });
          }

          return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group, gi) => (
                <Fragment key={`${group.schoolLabel ?? ""}-${group.year ?? "noyr"}-${gi}`}>
                  {(group.year || group.schoolLabel) && (
                    <div className="col-span-full flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                        {[group.schoolLabel, group.year].filter(Boolean).join(" · ")}
                      </span>
                      <hr className="flex-1 border-t border-gray-700" />
                    </div>
                  )}
                  {group.projects.map((project, index) => (
                    <ProjectCard
                      key={`${project.title}-${index}`}
                      project={project}
                      orderedSkills={renderProjectSkills(project)}
                      companies={companies}
                      schools={schools}
                      projectsData={projects}
                      hasAssociatedPublications={hasRelatedPublicationsForProject(project.id, publications)}
                      onProjectClick={onProjectClick}
                      hideYear
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          );
        }

        // Sort: end date descending, then start date descending
        const sortedProjects = filteredProjects.slice().sort((a, b) => {
          const parse = (d) => d ? new Date(d) : null;
          const aEnd = parse(getLatestEnd(a.dates)) || new Date(3000,0,1);
          const bEnd = parse(getLatestEnd(b.dates)) || new Date(3000,0,1);
          if (bEnd - aEnd !== 0) return bEnd - aEnd;
          const aStart = parse(getEarliestStart(a.dates)) || new Date(1000,0,1);
          const bStart = parse(getEarliestStart(b.dates)) || new Date(1000,0,1);
          return bStart - aStart;
        });
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project, index) => (
              <ProjectCard
                key={`${project.title}-${index}`}
                project={project}
                orderedSkills={renderProjectSkills(project)}
                companies={companies}
                schools={schools}
                projectsData={projects}
                hasAssociatedPublications={hasRelatedPublicationsForProject(project.id, publications)}
                onProjectClick={onProjectClick}
              />
            ))}
          </div>
        );
      })()}

      {(!featuredSelected || hasAnyFilter) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!featuredSelected && (
            <button
              type="button"
              onClick={() => {
                setSelectedProfessional([]);
                setSelectedAcademic([]);
                setSelectedSkills([]);
                setPersonalSelected(false);
                setFeaturedSelected(true);
                setOpenDropdown(null);
                const section = document.getElementById("projects");
                section?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-fit rounded border px-3 py-2 text-sm font-normal transition section-accent-button"
            >
              {`Show featured projects${hasOtherFilters ? "" : " only"} (${featuredProjectCount})`}
            </button>
          )}
          {(hasOtherFilters || featuredSelected) && (
            <button
              type="button"
              onClick={() => {
                clearAll();
                const section = document.getElementById("projects");
                section?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-fit rounded border px-3 py-2 text-sm font-normal transition section-accent-button"
            >
              {`Show all projects (${projects.length})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}