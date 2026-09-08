import SkillCategory from "./SkillCategory";
import FilterPanel from "./FilterPanel";
import { IoStar } from "react-icons/io5";
import { useState, useRef, useMemo, useEffect } from "react";
import { getSectionTheme } from "../config/sections";
import { skills, categories, getSkillCategoryId } from "@datapack/skills";
import { projects } from "@datapack/projects";
import { companies } from "@datapack/experience";
import { schools } from "@datapack/education";

export default function Skills({ onShowProjects, isActive, isPrevious = false, activeAccentLine, focusFilters = null, onClearFocusFilters, focusedSkillId = null, onClearFocusedSkillId, onShowCompany, onShowSchool }) {
    const sectionTheme = getSectionTheme("skills");
    // Only use activeAccentLine if isPrevious is true AND activeAccentLine is from Skills section
    // Otherwise, use Skills' own accentBorder
    const headerBottomColor = isActive
        ? sectionTheme.accentBorder
        : isPrevious && activeAccentLine === sectionTheme.accentLine
        ? sectionTheme.accentLine
        : sectionTheme.controlBorder;
    const [selectedProfessional, setSelectedProfessional] = useState([]);
    const [selectedAcademic, setSelectedAcademic] = useState([]);
    const [personalSelected, setPersonalSelected] = useState(false);
    const [featuredSelected, setFeaturedSelected] = useState(true);
    const [selectedSkillId, setSelectedSkillId] = useState(null);
    const categoryRefs = useRef({});
    const [rowMapByType, setRowMapByType] = useState({});
    const skillIdSet = useMemo(() => new Set(skills.map((s) => s.id)), []);

    const normalizeAssociationTag = (value) =>
        String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

    const schoolAssociationTagMap = useMemo(() =>
        new Map(
            schools.map((school) => {
                const labelTags = (school.labels || []).map(normalizeAssociationTag).filter(Boolean);
                return [school.id, new Set([school.id, ...labelTags])];
            })
        ),
        []
    );

        const featuredSkills = useMemo(
            () => skills.filter((skill) => skill.tags.includes("featured")),
            []
        );

        const baseProjects = useMemo(
            () => featuredSelected ? projects.filter((project) => project.tags.includes("featured")) : projects,
            [featuredSelected]
        );

        const visibleSkills = featuredSelected ? featuredSkills : skills;

        const selectedOrigins = useMemo(() => {
            const selectedAcademicTags = selectedAcademic.flatMap((schoolId) =>
                Array.from(schoolAssociationTagMap.get(schoolId) || new Set([schoolId]))
            );

            return Array.from(
                new Set([
                    ...selectedProfessional,
                    ...selectedAcademicTags,
                    ...(personalSelected ? ["personal"] : []),
                ])
            );
        }, [personalSelected, schoolAssociationTagMap, selectedAcademic, selectedProfessional]);

        const filteredSkills = useMemo(() => {
            if (selectedOrigins.length === 0) return visibleSkills;
            return visibleSkills.filter((skill) =>
                skill.tags?.some((tag) => selectedOrigins.includes(tag)) ||
                baseProjects.some(
                    (p) =>
                        p.tags.includes(skill.id) &&
                        p.tags.some((tag) => selectedOrigins.includes(tag))
                )
            );
        }, [baseProjects, selectedOrigins, visibleSkills]);

        const typeOrder = categories.map((c) => c.id);
        const typeLabels = Object.fromEntries(categories.map((c) => [c.id, c.title]));

        const grouped = useMemo(() => {
            return filteredSkills.reduce((acc, skill) => {
                const type = getSkillCategoryId(skill);
                if (!acc[type]) acc[type] = [];
                acc[type].push(skill);
                return acc;
            }, {});
        }, [filteredSkills]);

        const getUsage = (skillId) => {
            // Compute usage from the full projects set so toggling Featured
            // does not change inspection counts or associated tags.
            const skill = skills.find((s) => s.id === skillId);
            const skillTags = skill?.tags || [];
            const relatedProjects = projects.filter((p) => p.tags.includes(skillId));
            const professional = companies.filter((c) =>
                skillTags.includes(c.id) || relatedProjects.some((p) => p.tags.includes(c.id))
            );
            const academic = schools.filter((s) =>
                Array.from(schoolAssociationTagMap.get(s.id) || new Set([s.id])).some((tag) => skillTags.includes(tag)) ||
                relatedProjects.some((p) => p.tags.includes(s.id))
            );
            const personal = skillTags.includes("personal") || relatedProjects.some((p) => p.tags.includes("personal"))
                ? [{ id: "personal", title: "Personal" }]
                : [];
            return { professional, academic, personal, relatedProjects };
        };

        // Dropdowns should list origins independent of the Featured toggle,
        // so compute from the complete projects set.
        const companiesWithSkills = useMemo(() =>
            companies.filter((c) =>
                skills.some((s) => s.tags?.includes(c.id)) ||
                projects.some((p) => p.tags.includes(c.id) && p.tags.some((tag) => skillIdSet.has(tag)))
            ),
        [skillIdSet]);

        const schoolsWithSkills = useMemo(() =>
            schools.filter((school) => {
                const associationTags = Array.from(schoolAssociationTagMap.get(school.id) || new Set([school.id]));
                const hasDirectSkills = skills.some((skill) =>
                    associationTags.some((tag) => skill.tags?.includes(tag))
                );
                const hasProjectSkills = projects.some(
                    (p) => p.tags.includes(school.id) && p.tags.some((tag) => skillIdSet.has(tag))
                );
                return hasDirectSkills || hasProjectSkills;
            }),
        [schoolAssociationTagMap, skillIdSet]);

        const hasPersonalSkills = useMemo(() =>
            skills.some((s) => s.tags?.includes("personal")) ||
            projects.some((p) => p.tags.includes("personal") && p.tags.some((tag) => skillIdSet.has(tag))),
        [skillIdSet]);

        const chips = {
            featured: featuredSelected,
            professional: companies.filter((c) =>
                selectedProfessional.includes(c.id)
            ),
            academic: schools.filter((s) =>
                selectedAcademic.includes(s.id)
            ),
            personal: personalSelected,
            skills: [],
            onRemoveFeatured: () => setFeaturedSelected(false),
            onRemoveProfessional: (id) =>
                setSelectedProfessional((p) => p.filter((v) => v !== id)),
            onRemoveAcademic: (id) =>
                setSelectedAcademic((p) => p.filter((v) => v !== id)),
            onRemovePersonal: () => setPersonalSelected(false),
            onRemoveSkill: () => { },
        };

        const clearAll = () => {
            setSelectedProfessional([]);
            setSelectedAcademic([]);
            setPersonalSelected(false);
            setFeaturedSelected(false);
            setSelectedSkillId(null);
        };

        // Apply external focus filters when requested (e.g., via Show Skills button)
        // focusFilters shape: { professional: [companyIds], academic: [schoolIds], personal: boolean }
        useEffect(() => {
            if (!focusFilters) return;
            setSelectedProfessional(focusFilters.professional || []);
            setSelectedAcademic(focusFilters.academic || []);
            setPersonalSelected(!!focusFilters.personal);
            // Featured: use explicit value if provided; otherwise enable Featured only when no other filters present
            if (focusFilters.featured !== undefined) {
                setFeaturedSelected(!!focusFilters.featured);
            } else {
                const hasOther = (focusFilters.professional && focusFilters.professional.length > 0) || (focusFilters.academic && focusFilters.academic.length > 0) || !!focusFilters.personal;
                setFeaturedSelected(!hasOther);
            }
            setSelectedSkillId(null);
            // clear the external focus to avoid repeated reapplication
            onClearFocusFilters?.();
        }, [focusFilters, onClearFocusFilters]);

        useEffect(() => {
            if (!focusedSkillId) return;
            setSelectedProfessional([]);
            setSelectedAcademic([]);
            setPersonalSelected(false);
            setFeaturedSelected(false);
            const id = focusedSkillId;
            setTimeout(() => setSelectedSkillId(id), 0);
            onClearFocusedSkillId?.();
        }, [focusedSkillId]);

        useEffect(() => {
            const newRowMap = {};
            Object.entries(categoryRefs.current).forEach(([type, container]) => {
                if (!container) return;
                const nodes = container.querySelectorAll("[data-skill-id]");
                const map = {};
                let currentRowTop = null;
                let rowIndex = 0;
                nodes.forEach((node) => {
                    const rect = node.getBoundingClientRect();
                    if (currentRowTop === null) {
                        currentRowTop = rect.top;
                    }
                    if (Math.abs(rect.top - currentRowTop) > 5) {
                        rowIndex++;
                        currentRowTop = rect.top;
                    }
                    const id = node.getAttribute("data-skill-id");
                    map[id] = rowIndex;
                });
                newRowMap[type] = map;
            });
            setRowMapByType(newRowMap);
        }, [filteredSkills]);

        // Scroll category into view when a skill is selected
        useEffect(() => {
            if (!selectedSkillId) return;

            const skill = filteredSkills.find(s => s.id === selectedSkillId);
            if (!skill) return;
            const type = getSkillCategoryId(skill);

            const container = categoryRefs.current[type];
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Fully visible → nothing to do
            if (rect.top >= 0 && rect.bottom <= viewportHeight) return;

            if (rect.height <= viewportHeight) {
                // Category fits in viewport - scroll to make it fully visible
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                // Category taller than viewport → scroll to the selected skill
                const skillEl = container.querySelector(`[data-skill-id="${selectedSkillId}"]`);
                if (skillEl) {
                    skillEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, [filteredSkills, selectedSkillId]);

        const hasAnyFilter =
            featuredSelected ||
            selectedProfessional.length > 0 ||
            selectedAcademic.length > 0 ||
            personalSelected;
        const hasOtherFilters =
            selectedProfessional.length > 0 ||
            selectedAcademic.length > 0 ||
            personalSelected;
        const featuredSkillCount = skills.filter((skill) => skill.tags.includes("featured")).length;

        return (
            <section id="skills" className="py-16">
                <div
                    className="sticky top-12 lg:top-0 z-40 backdrop-blur border-b mb-6 relative transition-colors duration-300"
                    style={{
                        backgroundColor: isActive ? 'var(--section-active-bg)' : 'var(--section-base-bg)',
                        borderBottomColor: headerBottomColor
                    }}
                >
                    <div
                        className="absolute inset-0 transition-colors duration-300"
                        style={{ backgroundColor: isActive ? sectionTheme.stickyActiveOverlay : "transparent" }}
                    />
                    <div className="relative pt-4">
                        <h2 className="text-3xl font-bold mb-2">Skills</h2>
                        <FilterPanel
                            leadingControls={[
                                {
                                            id: "skill-featured",
                                            label: <span className="flex items-center gap-1.5"><IoStar size={14} className="opacity-60" />Featured</span>,
                                            active: featuredSelected,
                                            onClick: () => {
                                                setFeaturedSelected((prev) => {
                                                    const next = !prev;
                                                    if (next) {
                                                        // when enabling Featured, clear other filters
                                                        setSelectedProfessional([]);
                                                        setSelectedAcademic([]);
                                                        setPersonalSelected(false);
                                                        setSelectedSkillId(null);
                                                    }
                                                    return next;
                                                });
                                            },
                                        },
                            ]}
                            filters={[
                                {
                                    id: "skill-prof",
                                    label: "Professional",
                                    group: "associations",
                                    items: companiesWithSkills,
                                    selected: selectedProfessional,
                                    setSelected: (valueOrUpdater) => {
                                        setSelectedProfessional((prev) => {
                                            const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
                                            if (Array.isArray(next) && next.length > 0) setFeaturedSelected(false);
                                            return next;
                                        });
                                    },
                                },
                                {
                                    id: "skill-acad",
                                    label: "Academic",
                                    group: "associations",
                                    items: schoolsWithSkills,
                                    selected: selectedAcademic,
                                    setSelected: (valueOrUpdater) => {
                                        setSelectedAcademic((prev) => {
                                            const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
                                            if (Array.isArray(next) && next.length > 0) setFeaturedSelected(false);
                                            return next;
                                        });
                                    },
                                },
                            ]}
                            personal={hasPersonalSkills ? {
                                value: personalSelected,
                                setValue: (valueOrUpdater) => {
                                    setPersonalSelected((prev) => {
                                        const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
                                        if (next) setFeaturedSelected(false);
                                        return next;
                                    });
                                },
                            } : null}
                            onClearAll={clearAll}
                            chips={chips}
                        />
                    </div>
                </div>
                <div className="space-y-10">
                    {typeOrder.map((type) => {
                        const group = grouped[type];
                        if (!group) return null;
                        return (
                            <SkillCategory
                                key={type}
                                type={type}
                                label={typeLabels[type]}
                                skills={group}
                                rowMap={rowMapByType[type]}
                                containerRef={(el) => (categoryRefs.current[type] = el)}
                                selectedSkillId={selectedSkillId}
                                setSelectedSkillId={setSelectedSkillId}
                                getUsage={getUsage}
                                onShowProjects={onShowProjects}
                                onCompanyClick={(company) => onShowCompany?.(company.id)}
                                onSchoolClick={(school) => onShowSchool?.(school.id)}
                                onPersonalClick={() => {
                                    setFeaturedSelected(false);
                                    setPersonalSelected(true);
                                }}
                            />
                        );
                    })}
                </div>

                {(!featuredSelected || hasAnyFilter) && (
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {!featuredSelected && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedProfessional([]);
                                    setSelectedAcademic([]);
                                    setPersonalSelected(false);
                                    setFeaturedSelected(true);
                                    setSelectedSkillId(null);
                                    const section = document.getElementById("skills");
                                    section?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="w-fit rounded border px-3 py-2 text-sm font-normal transition section-accent-button"
                            >
                                {`Show featured skills${hasOtherFilters ? "" : " only"} (${featuredSkillCount})`}
                            </button>
                        )}
                        {(hasOtherFilters || featuredSelected) && (
                            <button
                                type="button"
                                onClick={() => {
                                    clearAll();
                                    const section = document.getElementById("skills");
                                    section?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="w-fit rounded border px-3 py-2 text-sm font-normal transition section-accent-button"
                            >
                                {`Show all skills (${skills.length})`}
                            </button>
                        )}
                    </div>
                )}
            </section>
        );
}