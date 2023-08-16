import React, { memo, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import ReactDOM from 'react-dom/client'
import styled from 'styled-components'
import { data } from './data'

const FlexWrapper = styled.div`
  display: flex;
`

const Column = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;
  display: flex;
  flex-direction: column;
`
const ColumnTitle = styled.h3`
  padding: 8px;
`
const TaskList = styled.div`
  padding: 8px;
  background-color: ${({ isDraggingOver }) => (isDraggingOver ? 'azure' : 'white')};
  flex-grow: 1;
  min-height: 100px;
`

const Task = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${({ isDragDisabled, isDragging }) =>
    isDragDisabled ? 'pink' : isDragging ? 'lightgray' : 'white'};
  display: flex;
  align-items: center;
`

// const Handle = styled.div`
//   width: 20px;
//   height: 20px;
//   background-color: orange;
//   border-radius: 4px;
//   margin-right: 8px;
// `

function App() {
  const [state, setState] = useState(data)

  return (
    <DragDropContext
      onDragEnd={({ destination, source, draggableId }) => {
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return
        }

        const start = state.columns[source.droppableId]
        const finish = state.columns[destination.droppableId]
        const newTaskIds = [...start.taskIds]

        if (start === finish) {
          newTaskIds.splice(source.index, 1)
          newTaskIds.splice(destination.index, 0, draggableId)

          const newColumn = {
            ...start,
            taskIds: newTaskIds,
          }

          setState({
            ...state,
            columns: {
              ...state.columns,
              [newColumn.id]: newColumn,
            },
          })
        }

        const startTaskIds = [...start.taskIds]
        startTaskIds.splice(source.index, 1)
        const newStart = {
          ...start,
          taskIds: startTaskIds,
        }

        const finishTaskIds = [...finish.taskIds]
        finishTaskIds.splice(destination.index, 0, draggableId)
        const newFinish = {
          ...finish,
          taskIds: finishTaskIds,
        }

        setState({
          ...state,
          columns: {
            ...state.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
          },
        })
      }}
    >
      <FlexWrapper>
        {state.columnOrder.map((columdId) => {
          const column = state.columns[columdId]
          const tasks = column.taskIds.map((taskId) => state.tasks[taskId])

          return (
            <Column key={column.id}>
              <ColumnTitle>{column.title}</ColumnTitle>

              <StrictModeDroppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={snapshot.isDraggingOver}
                  >
                    <InnerList tasks={tasks} />
                    {provided.placeholder}
                  </TaskList>
                )}
              </StrictModeDroppable>
            </Column>
          )
        })}
      </FlexWrapper>
    </DragDropContext>
  )
}

const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])
  if (!enabled) {
    return null
  }
  return <Droppable {...props}>{children}</Droppable>
}

const InnerList = memo(({ tasks }) => {
  return tasks.map((task, i) => {
    const isDragDisabled = task.id === 'task-1'

    return (
      <Draggable draggableId={task.id} index={i} key={task.id} isDragDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <Task
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            isDragDisabled={isDragDisabled}
          >
            {/* <Handle /> */}
            {task.content}
          </Task>
        )}
      </Draggable>
    )
  })
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
