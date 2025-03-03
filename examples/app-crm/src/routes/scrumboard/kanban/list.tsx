import { FC, PropsWithChildren, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
    HttpError,
    useDelete,
    useList,
    useUpdate,
    useUpdateMany,
} from "@refinedev/core";

import { ClearOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { DragEndEvent } from "@dnd-kit/core";
import { MenuProps } from "antd";

import { Task, TaskStage, TaskUpdateInput } from "@/interfaces";

import {
    KanbanAddCardButton,
    KanbanAddStageButton,
    KanbanBoard,
    KanbanBoardSkeleton,
    KanbanColumn,
    KanbanColumnSkeleton,
    KanbanItem,
    ProjectCardMemo,
    ProjectKanbanCardSkeleton,
} from "../components";

const taskFragment = [
    "id",
    "title",
    "description",
    "dueDate",
    "completed",
    "stageId",
    {
        checklist: ["title", "checked"],
    },
    {
        users: ["id", "name", "avatarUrl"],
    },
    {
        comments: ["totalCount"],
    },
];

export const KanbanPage: FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate();

    const { data: stages, isLoading: isLoadingStages } = useList<TaskStage>({
        resource: "taskStages",
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "createdAt",
                order: "asc",
            },
        ],
        meta: {
            fields: ["id", "title"],
        },
    });

    const { data: tasks, isLoading: isLoadingTasks } = useList<Task>({
        resource: "tasks",
        sorters: [
            {
                field: "dueDate",
                order: "asc",
            },
        ],
        queryOptions: {
            enabled: !!stages,
        },
        pagination: {
            mode: "off",
        },
        meta: {
            fields: taskFragment,
        },
    });

    // its convert Task[] to TaskStage[] (group by stage) for kanban
    // uses `stages` and `tasks` from useList hooks
    const taskStages = useMemo(() => {
        if (!tasks?.data || !stages?.data)
            return {
                unassignedStage: [],
                stages: [],
            };

        const unassignedStage = tasks.data.filter(
            (task) => task.stageId === null,
        );

        // prepare unassigned stage
        const grouped: TaskStage[] = stages.data.map((stage) => ({
            ...stage,
            tasks: tasks.data.filter(
                (task) => task.stageId?.toString() === stage.id,
            ),
        }));

        return {
            unassignedStage,
            stages: grouped,
        };
    }, [tasks, stages]);

    const { mutate: updateTask } = useUpdate<
        Task,
        HttpError,
        TaskUpdateInput
    >();
    const { mutate: updateManyTask } = useUpdateMany();
    const { mutate: deleteStage } = useDelete();

    const handleOnDragEnd = (event: DragEndEvent) => {
        let stageId = event.over?.id as undefined | string | null;
        const taskId = event.active.id as string;
        const taskStageId = event.active.data.current?.stageId;

        if (taskStageId === stageId) {
            return;
        }

        if (stageId === "unassigned") {
            stageId = null;
        }

        updateTask({
            resource: "tasks",
            id: taskId,
            values: {
                stageId: stageId,
            },
            successNotification: false,
            mutationMode: "optimistic",
        });
    };

    const handleAddStage = () => {
        navigate("/scrumboard/kanban/stages/create", {
            replace: true,
        });
    };

    const handleEditStage = (args: { stageId: string }) => {
        const path = `/scrumboard/kanban/stages/edit/${args.stageId}`;
        navigate(path, {
            replace: true,
        });
    };

    const handleDeleteStage = (args: { stageId: string }) => {
        deleteStage({
            resource: "taskStage",
            id: args.stageId,
            successNotification: () => ({
                key: "delete-stage",
                type: "success",
                message: "Successfully deleted stage",
                description: "Successful",
            }),
        });
    };

    const handleAddCard = (args: { stageId: string }) => {
        const path =
            args.stageId === "unassigned"
                ? "create"
                : `create?stageId=${args.stageId}`;
        navigate(path, {
            replace: true,
        });
    };

    const handleClearCards = (args: { taskIds: string[] }) => {
        updateManyTask({
            resource: "tasks",
            ids: args.taskIds,
            values: {
                stageId: null,
            },
            successNotification: false,
        });
    };

    const getContextMenuItems = ({ column }: { column: TaskStage }) => {
        const hasItems = column.tasks.length > 0;

        const items: MenuProps["items"] = [
            {
                label: "Edit status",
                key: "1",
                icon: <EditOutlined />,
                onClick: () => handleEditStage({ stageId: column.id }),
            },
            {
                label: "Clear all cards",
                key: "2",
                icon: <ClearOutlined />,
                disabled: !hasItems,
                onClick: () =>
                    handleClearCards({
                        taskIds: column.tasks.map((task) => task.id),
                    }),
            },
            {
                danger: true,
                label: "Delete status",
                key: "3",
                icon: <DeleteOutlined />,
                disabled: hasItems,
                onClick: () => handleDeleteStage({ stageId: column.id }),
            },
        ];

        return items;
    };

    const isLoading = isLoadingTasks || isLoadingStages;

    if (isLoading) return <PageSkeleton />;

    return (
        <>
            <KanbanBoard onDragEnd={handleOnDragEnd}>
                <KanbanColumn
                    id={"unassigned"}
                    title={"unassigned"}
                    count={taskStages?.unassignedStage?.length || 0}
                    onAddClick={() => handleAddCard({ stageId: "unassigned" })}
                >
                    {taskStages.unassignedStage?.map((task) => {
                        return (
                            <KanbanItem
                                key={task.id}
                                id={task.id}
                                data={{ ...task, stageId: "unassigned" }}
                            >
                                <ProjectCardMemo {...task} />
                            </KanbanItem>
                        );
                    })}
                    {!taskStages.unassignedStage?.length && (
                        <KanbanAddCardButton
                            onClick={() =>
                                handleAddCard({ stageId: "unassigned" })
                            }
                        />
                    )}
                </KanbanColumn>
                {taskStages.stages?.map((column) => {
                    const contextMenuItems = getContextMenuItems({ column });

                    return (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            count={column.tasks.length}
                            contextMenuItems={contextMenuItems}
                            onAddClick={() =>
                                handleAddCard({ stageId: column.id })
                            }
                        >
                            {isLoading && <ProjectKanbanCardSkeleton />}
                            {!isLoading &&
                                column.tasks.map((task) => {
                                    return (
                                        <KanbanItem
                                            key={task.id}
                                            id={task.id}
                                            data={{
                                                ...task,
                                                stageId: column.id,
                                            }}
                                        >
                                            <ProjectCardMemo {...task} />
                                        </KanbanItem>
                                    );
                                })}
                            {!column.tasks.length && (
                                <KanbanAddCardButton
                                    onClick={() =>
                                        handleAddCard({ stageId: column.id })
                                    }
                                />
                            )}
                        </KanbanColumn>
                    );
                })}
                <KanbanAddStageButton onClick={handleAddStage} />
            </KanbanBoard>
            {children}
        </>
    );
};

const PageSkeleton = () => {
    const columnCount = 6;
    const itemCount = 4;

    return (
        <KanbanBoardSkeleton>
            {Array.from({ length: columnCount }).map((_, index) => {
                return (
                    <KanbanColumnSkeleton key={index} type="project">
                        {Array.from({ length: itemCount }).map((_, index) => {
                            return <ProjectKanbanCardSkeleton key={index} />;
                        })}
                    </KanbanColumnSkeleton>
                );
            })}
        </KanbanBoardSkeleton>
    );
};
